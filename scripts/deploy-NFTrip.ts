import { ethers } from "hardhat";

async function main() {
  console.log("Deploying NFTrip contract...");
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contract with account:", deployer.address);

  const accountBalance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance: ", accountBalance.toString())

  const NFTripContractFactory = await ethers.getContractFactory("NFTrip");
  const NFTripContract = await NFTripContractFactory.deploy();
  const NFTrip = await NFTripContract.waitForDeployment();
  console.log("NFTrip deployed to:", await NFTrip.getAddress());
  console.log("Deployment completed successfully!");

  console.log("Initializing locations...");
  await NFTrip.initializeLocations();
  console.log("Locations initialized");
}

main().catch((error) => {
  console.log(error);
  process.exitCode = 1;
});