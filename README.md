# 概要


# Docs
https://ryotos-organization.gitbook.io/nftrip

# アーキテクチャ図
<img src="dapp-architecture.png" width="500" alt="DApps Architecture Diagram">

# ER図
<img src="dapps-er-diagram.png" width="500" alt="DApps ER Diagram">

# Contract Address
```
NFTRIP_ADDRESS:0xbe7EeFb23E7B970fcC05F061ba22A0E8dAd94518
FAUCET_ADDRESS:0x3dA5c533d839e7a03B1D1a674456dBCf52759d88
FORWARDER_ADDRESS:0x56823B1E1eFcb375774AE955cCE6B1960F083C70
```

# Hardhatコマンド
```shell
npx hardhat compile
npx hardhat test "test/,,,"
npx hardhat run scripts/,,,, --network sepolia
```

# スマートコントラクトVerifyコマンド
```
npx hardhat verify --network sepolia CONTRACT_ADRESS
```
