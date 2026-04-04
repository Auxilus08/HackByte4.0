// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title RewardPool
 * @notice Distributes MATIC rewards to verified SmartAccident volunteers.
 * @dev Only the contract owner (deployer) can trigger reward payouts.
 *      The contract holds a pool of native MATIC. When a volunteer completes
 *      and verifies an accident response task, the backend calls
 *      distributeReward() to send them their reward.
 */
contract RewardPool is Ownable, ReentrancyGuard {

    // ── Events ────────────────────────────────────────────────
    event RewardDistributed(
        address indexed volunteer,
        uint256 amount,
        bytes32 indexed taskId,
        uint256 timestamp
    );

    event PoolFunded(address indexed funder, uint256 amount);

    // ── State ─────────────────────────────────────────────────
    uint256 public totalDistributed;
    uint256 public totalRewards;

    mapping(bytes32 => bool) public taskRewarded;            // prevent double-payout
    mapping(address => uint256) public volunteerEarnings;    // lifetime earnings per volunteer

    // ── Constructor ───────────────────────────────────────────
    constructor() Ownable(msg.sender) {}

    // ── Receive MATIC to fund the pool ────────────────────────
    receive() external payable {
        emit PoolFunded(msg.sender, msg.value);
    }

    // ── Core: distribute reward to a volunteer ────────────────
    /**
     * @notice Send a MATIC reward to a volunteer for a verified task.
     * @param volunteer  The volunteer's wallet address.
     * @param taskId     Unique identifier for the task (keccak256 of UUID).
     */
    function distributeReward(
        address payable volunteer,
        bytes32 taskId
    ) external onlyOwner nonReentrant {
        require(volunteer != address(0), "Invalid volunteer address");
        require(!taskRewarded[taskId], "Task already rewarded");
        require(address(this).balance > 0, "Pool is empty");

        // Fixed reward amount: 0.01 MATIC per verified task
        uint256 rewardAmount = 0.01 ether;
        require(address(this).balance >= rewardAmount, "Insufficient pool balance");

        taskRewarded[taskId] = true;
        totalDistributed += rewardAmount;
        totalRewards += 1;
        volunteerEarnings[volunteer] += rewardAmount;

        (bool sent, ) = volunteer.call{value: rewardAmount}("");
        require(sent, "MATIC transfer failed");

        emit RewardDistributed(volunteer, rewardAmount, taskId, block.timestamp);
    }

    // ── View functions ────────────────────────────────────────
    function poolBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function getVolunteerEarnings(address volunteer) external view returns (uint256) {
        return volunteerEarnings[volunteer];
    }

    function isTaskRewarded(bytes32 taskId) external view returns (bool) {
        return taskRewarded[taskId];
    }
}
