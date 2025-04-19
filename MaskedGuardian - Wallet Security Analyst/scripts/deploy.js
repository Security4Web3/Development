const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("🚀 Deploying with address:", deployer.address);

  // Deploy MockStream (you need this first!)
  const Stream = await hre.ethers.getContractFactory("MockStream");
  const stream = await Stream.deploy();
  await stream.waitForDeployment();
  const streamAddress = await stream.getAddress();
  console.log("✅ MockStream deployed at:", streamAddress);

  // Deploy MaskedGuardian
  const Guardian = await hre.ethers.getContractFactory("MaskedGuardian");
  const guardian = await Guardian.deploy(streamAddress, deployer.address);
  await guardian.waitForDeployment();
  const guardianAddress = await guardian.getAddress();
  console.log("✅ MaskedGuardian deployed at:", guardianAddress);
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
