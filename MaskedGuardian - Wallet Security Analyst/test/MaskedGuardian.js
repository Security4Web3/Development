const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MaskedGuardian", function () {
  let deployer, guardian, user;
  let streamContract, guardianContract;

  beforeEach(async () => {
    [deployer, guardian, user] = await ethers.getSigners();

    console.log("Deployer:", deployer.address);
    console.log("Guardian:", guardian.address);
    console.log("User:", user.address);

    const Stream = await ethers.getContractFactory("MockStream");
    streamContract = await Stream.deploy();
    await streamContract.waitForDeployment();

    const Guardian = await ethers.getContractFactory("MaskedGuardian");
    guardianContract = await Guardian.deploy(
      await streamContract.getAddress(),
      guardian.address
    );
    await guardianContract.waitForDeployment();
  });

  it("should ignore low-flow-rate stream", async () => {
    // Create a low flow rate stream
    const lowFlowRate = ethers.parseEther("0.1") / 3600n;


    await streamContract.connect(user).createStream(1, user.address, lowFlowRate);

    await guardianContract.connect(guardian).analyzeAndPause(1);
    const paused = await streamContract.isStreamPaused(1);
    expect(paused).to.equal(false);
  });

  it("should pause high-flow-rate stream", async () => {
    // Create a high flow rate stream
    const highFlowRate = ethers.parseEther("1.1"); // above 1 ETH/hour
    await streamContract.connect(user).createStream(2, user.address, highFlowRate);

    await guardianContract.connect(guardian).analyzeAndPause(2);
    const paused = await streamContract.isStreamPaused(2);
    expect(paused).to.equal(true);
  });
});
