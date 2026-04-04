"""
Blockchain reward distribution service.

Interacts with the RewardPool smart contract on Polygon to distribute
MATIC rewards to verified volunteers. Falls back gracefully when
Web3 is not configured (e.g. during development without a testnet).
"""

import logging
from hashlib import sha256

from src.config.settings import settings

logger = logging.getLogger(__name__)

# ── Minimal ABI for the RewardPool contract ────────────────────
REWARD_POOL_ABI = [
    {
        "inputs": [
            {"internalType": "address payable", "name": "volunteer", "type": "address"},
            {"internalType": "bytes32", "name": "taskId", "type": "bytes32"},
        ],
        "name": "distributeReward",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function",
    },
    {
        "inputs": [],
        "name": "poolBalance",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [{"internalType": "bytes32", "name": "taskId", "type": "bytes32"}],
        "name": "isTaskRewarded",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [{"internalType": "address", "name": "volunteer", "type": "address"}],
        "name": "getVolunteerEarnings",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [],
        "name": "totalRewards",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [],
        "name": "totalDistributed",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function",
    },
]


class BlockchainService:
    """Handles interaction with the RewardPool smart contract on Polygon.

    Falls back to a mock/log mode when Web3 credentials are not configured,
    allowing development and testing without a live blockchain connection.
    """

    def __init__(self):
        self._web3 = None
        self._contract = None
        self._account = None
        self._initialized = False

    @property
    def is_configured(self) -> bool:
        """Check if all blockchain env vars are properly set."""
        return bool(
            settings.WEB3_PROVIDER_URL
            and settings.REWARD_CONTRACT_ADDRESS
            and settings.DEPLOYER_PRIVATE_KEY
            and settings.WEB3_PROVIDER_URL not in ("", "your_polygon_rpc")
            and settings.REWARD_CONTRACT_ADDRESS not in ("", "0x...")
            and settings.DEPLOYER_PRIVATE_KEY not in ("", "0x...")
        )

    def _init_web3(self):
        """Lazy-initialize Web3 connection and contract instance."""
        if self._initialized:
            return

        self._initialized = True

        if not self.is_configured:
            logger.warning(
                "Blockchain not configured — reward distribution will be simulated. "
                "Set WEB3_PROVIDER_URL, REWARD_CONTRACT_ADDRESS, and DEPLOYER_PRIVATE_KEY in .env"
            )
            return

        try:
            from web3 import Web3

            self._web3 = Web3(Web3.HTTPProvider(settings.WEB3_PROVIDER_URL))

            if not self._web3.is_connected():
                logger.error("Failed to connect to Web3 provider: %s", settings.WEB3_PROVIDER_URL)
                self._web3 = None
                return

            self._contract = self._web3.eth.contract(
                address=Web3.to_checksum_address(settings.REWARD_CONTRACT_ADDRESS),
                abi=REWARD_POOL_ABI,
            )

            self._account = self._web3.eth.account.from_key(settings.DEPLOYER_PRIVATE_KEY)

            logger.info(
                "Blockchain service initialized — contract=%s, deployer=%s, chain=%s",
                settings.REWARD_CONTRACT_ADDRESS[:10] + "...",
                self._account.address[:10] + "...",
                self._web3.eth.chain_id,
            )

        except ImportError:
            logger.error("web3 package not installed — run: pip install web3")
            self._web3 = None
        except Exception as e:
            logger.error("Blockchain initialization failed: %s", e)
            self._web3 = None

    @staticmethod
    def _task_id_to_bytes32(task_id: str) -> bytes:
        """Convert a UUID string to a bytes32 hash for the smart contract."""
        return bytes.fromhex(sha256(task_id.encode()).hexdigest())

    async def distribute_reward(
        self,
        volunteer_wallet: str,
        task_id: str,
    ) -> str | None:
        """Distribute a MATIC reward to a volunteer for a verified task.

        Args:
            volunteer_wallet: Volunteer's Ethereum/Polygon wallet address
            task_id: UUID string of the verified task

        Returns:
            Transaction hash string on success, None on failure or simulation
        """
        self._init_web3()

        task_bytes32 = self._task_id_to_bytes32(task_id)

        # ── Simulation mode (no blockchain configured) ─────────
        if self._web3 is None or self._contract is None:
            # Generate a fake tx hash for demo purposes
            fake_hash = "0x" + sha256(f"sim-{task_id}-{volunteer_wallet}".encode()).hexdigest()
            logger.info(
                "🔗 [SIMULATED] Reward distributed → volunteer=%s, task=%s, fake_tx=%s",
                volunteer_wallet, task_id[:8], fake_hash[:18] + "...",
            )
            return fake_hash

        # ── Real blockchain transaction ────────────────────────
        try:
            from web3 import Web3

            volunteer_addr = Web3.to_checksum_address(volunteer_wallet)

            # Check if already rewarded
            already_rewarded = self._contract.functions.isTaskRewarded(task_bytes32).call()
            if already_rewarded:
                logger.warning("Task %s already rewarded on-chain", task_id[:8])
                return None

            # Check pool balance
            pool_bal = self._contract.functions.poolBalance().call()
            reward_amount = Web3.to_wei(0.01, "ether")
            if pool_bal < reward_amount:
                logger.error(
                    "Insufficient pool balance: %s wei < %s wei",
                    pool_bal, reward_amount,
                )
                return None

            # Build transaction
            nonce = self._web3.eth.get_transaction_count(self._account.address)
            tx = self._contract.functions.distributeReward(
                volunteer_addr,
                task_bytes32,
            ).build_transaction({
                "from": self._account.address,
                "nonce": nonce,
                "gas": 100_000,
                "gasPrice": self._web3.eth.gas_price,
            })

            # Sign and send
            signed_tx = self._web3.eth.account.sign_transaction(tx, self._account.key)
            tx_hash = self._web3.eth.send_raw_transaction(signed_tx.raw_transaction)
            tx_hash_hex = tx_hash.hex()

            logger.info(
                "🔗 Reward transaction sent → volunteer=%s, task=%s, tx=%s",
                volunteer_wallet[:10] + "...", task_id[:8], tx_hash_hex,
            )

            # Wait for confirmation (with timeout)
            receipt = self._web3.eth.wait_for_transaction_receipt(tx_hash, timeout=30)

            if receipt["status"] == 1:
                logger.info("✅ Reward confirmed — block=%s, gas=%s", receipt["blockNumber"], receipt["gasUsed"])
                return tx_hash_hex
            else:
                logger.error("❌ Reward transaction reverted — tx=%s", tx_hash_hex)
                return None

        except Exception as e:
            logger.error("Blockchain reward distribution failed: %s", e)
            return None

    async def get_pool_info(self) -> dict:
        """Get current pool status (balance, total distributed, etc.)."""
        self._init_web3()

        if self._web3 is None or self._contract is None:
            return {
                "configured": False,
                "pool_balance": "0",
                "total_distributed": "0",
                "total_rewards": 0,
                "message": "Blockchain not configured — running in simulation mode",
            }

        try:
            from web3 import Web3

            balance = self._contract.functions.poolBalance().call()
            total_distributed = self._contract.functions.totalDistributed().call()
            total_rewards = self._contract.functions.totalRewards().call()

            return {
                "configured": True,
                "contract_address": settings.REWARD_CONTRACT_ADDRESS,
                "pool_balance": Web3.from_wei(balance, "ether"),
                "total_distributed": Web3.from_wei(total_distributed, "ether"),
                "total_rewards": total_rewards,
            }
        except Exception as e:
            logger.error("Failed to fetch pool info: %s", e)
            return {"configured": True, "error": str(e)}


# Module-level singleton
blockchain_svc = BlockchainService()
