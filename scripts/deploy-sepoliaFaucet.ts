import { ethers, run } from "hardhat";
import { Defender } from '@openzeppelin/defender-sdk';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  // MinimalForwarderのデプロイ
  const MinimalForwarder = await ethers.getContractFactory("MinimalForwarder");
  const forwarder = await MinimalForwarder.deploy();
  await forwarder.waitForDeployment();
  const forwarderAddress = await forwarder.getAddress()
  console.log("MinimalForwarder deployed to:", forwarderAddress);

  // SepoliaFaucetのデプロイ
  const Faucet = await ethers.getContractFactory("SepoliaFaucet");
  // スマートコントラクトのconstructorにforwarderAddressを渡す
  const faucet = await Faucet.deploy(forwarderAddress);
  await faucet.waitForDeployment();
  const faucetAddress = await faucet.getAddress();

  console.log("Deployed contracts:");
  console.log("Faucet:", faucetAddress);
  console.log("Using Forwarder:", forwarderAddress);

  // MinimalForwarderの検証
  await verifyContract(forwarderAddress, []);

  // SepoliaFaucetの検証（forwarderAddressをコンストラクタ引数として渡す）
  await verifyContract(faucetAddress, [forwarderAddress]);
}

// verifyContract関数の修正
async function verifyContract(contractAddress: string, constructorArguments: any[]) {
  console.log("Verifying contract...");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: constructorArguments,
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

// エラーハンドリングの改善
main().catch((error) => {
  console.error("Error in deployment:", error);
  process.exitCode = 1;
});