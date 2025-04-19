const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MaskedGuardian", function () {
  let deployer, guardian, user;
  let streamContract, guardianContract;

  beforeEach(async () => {
    [deployer, guardian, user] = await ethers.getSigners();

    const Stream = await ethers.getContractFactory("MockStream");
    streamContract = await Stream.deploy();

    const Guardian = await ethers.getContractFactory("MaskedGuardian");
    guardianContract = await Guardian.deploy(streamContract.address, guardian.address);

    console.log("Stream Contract:", streamContract.address);
    console.log("Guardian Address:", guardian.address);

    // Safe stream
    await streamContract.connect(user).createStream(
      1,
      deployer.address,
      ethers.utils.parseEther("0.01")
    );

    // High-risk stream
    await streamContract.connect(user).createStream(
      2,
      deployer.address,
      ethers.utils.parseEther("1.5")
    );
  });

  it("should ignore low-flow-rate stream", async () => {
    await guardianContract.connect(guardian).analyzeAndPause(1);
    const paused = await streamContract.isStreamPaused(1);
    expect(paused).to.equal(false);
  });

  it("should pause high-flow-rate stream", async () => {
    await guardianContract.connect(guardian).analyzeAndPause(2);
    const paused = await streamContract.isStreamPaused(2);
    expect(paused).to.equal(true);
  });
});
