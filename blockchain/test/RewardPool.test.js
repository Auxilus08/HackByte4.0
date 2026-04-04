const { expect } = require("chai");
const { ethers } = require("hardhat");
require("@nomicfoundation/hardhat-chai-matchers");

describe("RewardPool", function () {
  let rewardPool, owner, volunteer1, volunteer2;

  beforeEach(async function () {
    [owner, volunteer1, volunteer2] = await ethers.getSigners();

    const RewardPool = await ethers.getContractFactory("RewardPool");
    rewardPool = await RewardPool.deploy();
    await rewardPool.waitForDeployment();

    // Fund pool with 1 MATIC
    await owner.sendTransaction({
      to: await rewardPool.getAddress(),
      value: ethers.parseEther("1.0"),
    });
  });

  describe("Deployment", function () {
    it("should set the deployer as owner", async function () {
      expect(await rewardPool.owner()).to.equal(owner.address);
    });

    it("should have 1 MATIC in the pool", async function () {
      expect(await rewardPool.poolBalance()).to.equal(ethers.parseEther("1.0"));
    });
  });

  describe("Reward Distribution", function () {
    it("should distribute 0.01 MATIC to volunteer", async function () {
      const taskId = ethers.keccak256(ethers.toUtf8Bytes("task-uuid-123"));
      const balBefore = await ethers.provider.getBalance(volunteer1.address);

      await expect(rewardPool.distributeReward(volunteer1.address, taskId))
        .to.emit(rewardPool, "RewardDistributed")
        .withArgs(
          volunteer1.address,
          ethers.parseEther("0.01"),
          taskId,
          (ts) => ts > 0 // any positive timestamp
        );

      const balAfter = await ethers.provider.getBalance(volunteer1.address);
      expect(balAfter - balBefore).to.equal(ethers.parseEther("0.01"));
      expect(await rewardPool.totalRewards()).to.equal(1);
      expect(await rewardPool.totalDistributed()).to.equal(ethers.parseEther("0.01"));
    });

    it("should prevent double-payout for same task", async function () {
      const taskId = ethers.keccak256(ethers.toUtf8Bytes("task-uuid-456"));
      await rewardPool.distributeReward(volunteer1.address, taskId);

      await expect(
        rewardPool.distributeReward(volunteer1.address, taskId)
      ).to.be.revertedWith("Task already rewarded");
    });

    it("should track volunteer earnings", async function () {
      const task1 = ethers.keccak256(ethers.toUtf8Bytes("task-1"));
      const task2 = ethers.keccak256(ethers.toUtf8Bytes("task-2"));

      await rewardPool.distributeReward(volunteer1.address, task1);
      await rewardPool.distributeReward(volunteer1.address, task2);

      expect(await rewardPool.getVolunteerEarnings(volunteer1.address))
        .to.equal(ethers.parseEther("0.02"));
    });

    it("should reject zero address", async function () {
      const taskId = ethers.keccak256(ethers.toUtf8Bytes("task-bad"));
      await expect(
        rewardPool.distributeReward(ethers.ZeroAddress, taskId)
      ).to.be.revertedWith("Invalid volunteer address");
    });

    it("should only allow owner to distribute", async function () {
      const taskId = ethers.keccak256(ethers.toUtf8Bytes("task-unauth"));
      await expect(
        rewardPool.connect(volunteer1).distributeReward(volunteer2.address, taskId)
      ).to.be.revertedWithCustomError(rewardPool, "OwnableUnauthorizedAccount");
    });
  });

  describe("Pool Management", function () {
    it("should accept MATIC funding", async function () {
      const addr = await rewardPool.getAddress();
      await expect(
        owner.sendTransaction({ to: addr, value: ethers.parseEther("0.5") })
      ).to.emit(rewardPool, "PoolFunded");

      expect(await rewardPool.poolBalance()).to.equal(ethers.parseEther("1.5"));
    });
  });
});
