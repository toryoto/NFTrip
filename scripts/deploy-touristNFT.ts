import { ethers } from "hardhat";

async function main() {
  const TouristNFT = await ethers.getContractFactory("TouristNFT");
  const initialLocationIds = [1, 2, 3, 4, 5, 6];
  const touristNFT = await TouristNFT.deploy(initialLocationIds);
  await touristNFT.waitForDeployment();

  console.log(`touristNFT deployed to: ${touristNFT.target}`);
}

main().catch((error) => {
  console.log(error);
  process.exitCode = 1;
});