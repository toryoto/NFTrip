import { ethers, run } from "hardhat";

async function main() {
  console.log("Deploying SepoliaFaucet contract...");
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contract with account:", deployer.address);

  const accountBalance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance: ", accountBalance.toString())

  const SepoliaFaucetContractFactory = await ethers.getContractFactory("SepoliaFaucet");
  const SepoliaFaucetContract = await SepoliaFaucetContractFactory.deploy();
  const sepoliaFaucet = await SepoliaFaucetContract.waitForDeployment();
	await verifyContract(await SepoliaFaucetContract.getAddress());
  console.log("SepoliaFaucet deployed to:", await sepoliaFaucet.getAddress());
  console.log("Deployment completed successfully!");
}

async function verifyContract(contractAddress: string) {
  console.log("Verifying contract...");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: [],
    });
    console.log("Contract verified successfully");
  } catch (e: any) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Contract is already verified!");
    } else {
      console.log("Error verifying contract:", e);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});