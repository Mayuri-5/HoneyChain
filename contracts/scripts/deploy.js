const hre = require("hardhat");

async function main() {
  const HoneyTraceability = await hre.ethers.getContractFactory("HoneyTraceability");
  const contract = await HoneyTraceability.deploy();
  await contract.waitForDeployment();

  console.log(`Deployed HoneyTraceability to ${await contract.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});