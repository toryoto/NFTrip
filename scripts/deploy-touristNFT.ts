import { ethers } from "hardhat";

async function main() {
  const TouristNFT = await ethers.getContractFactory("TouristNFT");
  const touristNFT = await TouristNFT.deploy();
  await touristNFT.waitForDeployment();
  console.log(`touristNFT deployed to: ${touristNFT.target}`);

  console.log("Initializing locations...");
  await touristNFT.initializeLocations();
  console.log("Locations initialized");
}

main().catch((error) => {
  console.log(error);
  process.exitCode = 1;
});