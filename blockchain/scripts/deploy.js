/**
 * Deploy RewardPool contract.
 *
 * Usage:
 *   npx hardhat run scripts/deploy.js                  # local hardhat network
 *   npx hardhat run scripts/deploy.js --network amoy   # Polygon Amoy testnet
 */

const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("═══════════════════════════════════════════════════");
  console.log("  SmartAccident — RewardPool Deployment");
  console.log("═══════════════════════════════════════════════════");
  console.log(`  Deployer : ${deployer.address}`);
  console.log(`  Network  : ${hre.network.name}`);
  console.log(`  Balance  : ${hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address))} MATIC`);
  console.log("───────────────────────────────────────────────────");

  // Deploy RewardPool
  const RewardPool = await hre.ethers.getContractFactory("RewardPool");
  const rewardPool = await RewardPool.deploy();
  await rewardPool.waitForDeployment();

  const contractAddress = await rewardPool.getAddress();

  console.log(`  ✅ RewardPool deployed to: ${contractAddress}`);
  console.log("───────────────────────────────────────────────────");

  // Fund the pool with a small amount for testing
  if (hre.network.name === "hardhat" || hre.network.name === "localhost") {
    const fundTx = await deployer.sendTransaction({
      to: contractAddress,
      value: hre.ethers.parseEther("1.0"),
    });
    await fundTx.wait();
    console.log("  💰 Funded pool with 1.0 MATIC (local test)");
  }

  console.log("");
  console.log("  Add this to your .env:");
  console.log(`  REWARD_CONTRACT_ADDRESS=${contractAddress}`);
  console.log("═══════════════════════════════════════════════════");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
