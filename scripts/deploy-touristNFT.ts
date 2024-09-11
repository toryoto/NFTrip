import { ethers } from "hardhat";

async function main() {
  console.log("Deploying TouristNFT contract...");
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contract with account:", deployer.address);

  const accountBalance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance: ", accountBalance.toString())

  const TouristNFTContractFactory = await ethers.getContractFactory("TouristNFT");
  const touristNFTContract = await TouristNFTContractFactory.deploy();
  const touristNFT = await touristNFTContract.waitForDeployment();
  console.log("TouristNFT deployed to:", await touristNFT.getAddress());
  console.log("Deployment completed successfully!");

  console.log("Initializing locations...");
  await touristNFT.initializeLocations();
  console.log("Locations initialized");
}

main().catch((error) => {
  console.log(error);
  process.exitCode = 1;
});