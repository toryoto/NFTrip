// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SepoliaFaucet {
	address public owner;
	uint256 public withdrawalAmount = 0.05 ether;
	uint256 public lockTime = 2 days;

	mapping(address => uint256) lastWithdrawTime;

	// トークンの引き出し(Faucet)とコントラクトへのトークン追加に透明性を持たせるためのイベント
	event Withdrawal(address indexed to, uint256 amount);
  event Deposit(address indexed from, uint256 amount);

	// Faucetの条件変更　に透明性を持たせるためのイベント
	event WithdrawalAmountChanged(uint256 oldAmount, uint256 newAmount);
	event LockTimeChanged(uint256 oldTime, uint256 newTime);

	constructor() {
    owner = msg.sender;
  }

	modifier onlyOwner() {
		require(msg.sender == owner, "Only the owner can call this function");
		_;
	}

	// コントラクトがEtherを受け取った時に自動的に呼び出されるメソッド
	receive() external payable {
		emit Deposit(msg.sender, msg.value);
	}

	function requestTokens() external {
		require(block.timestamp >= lastWithdrawTime[msg.sender] + lockTime, "Must wait 2 days between withdrawals");
		require(address(this).balance >= withdrawalAmount, "Faucet is empty");

		lastWithdrawTime[msg.sender] = block.timestamp;
		payable(msg.sender).transfer(withdrawalAmount);

		emit Withdrawal(msg.sender, withdrawalAmount);
	}

	// ownerがトークン数を変更する
	function setWithdrawalAmount(uint256 amount) external onlyOwner() {
		uint256 oldAmount = withdrawalAmount;
    withdrawalAmount = amount;
		emit WithdrawalAmountChanged(oldAmount, amount);
	}

	// ownerがfaucet時間を変更する
	function setLockTime(uint256 newTime) external onlyOwner {
		uint256 oldTime = lockTime;
		lockTime = newTime;
		emit LockTimeChanged(oldTime, newTime);
  }

	function withdraw() external onlyOwner() {
		payable(owner).transfer(address(this).balance);
	}
}