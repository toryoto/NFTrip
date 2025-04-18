// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import "@openzeppelin/contracts/metatx/MinimalForwarder.sol";

contract SepoliaFaucet is ERC2771Context {
	address public owner;
	uint256 public withdrawalAmount = 0.01 ether;
	uint256 public lockTime = 2 days;

	mapping(address => uint256) lastWithdrawTime;

	// トークンの引き出し(Faucet)とコントラクトへのトークン追加に透明性を持たせるためのイベント
	event Withdrawal(address indexed to, uint256 amount);
  event Deposit(address indexed from, uint256 amount);

	// Faucetの条件変更　に透明性を持たせるためのイベント
	event WithdrawalAmountChanged(uint256 oldAmount, uint256 newAmount);
	event LockTimeChanged(uint256 oldTime, uint256 newTime);

	constructor(MinimalForwarder forwarder) ERC2771Context(address(forwarder)) {
		// メタトランザクションをサポートするために、_msgSender()を使用して元の送信者を取得
		owner = _msgSender();
	}

	modifier onlyOwner() {
		require( _msgSender() == owner, "Only the owner can call this function");
		_;
	}

	// コントラクトがEtherを受け取った時に自動的に呼び出されるメソッド
	receive() external payable {
		emit Deposit(_msgSender(), msg.value);
	}

	// 実行するのはForwarderだが結果を受け取るのは元の送信者
	function requestTokens() external {
		// メタトランザクションをサポートするために、_msgSender()を使用して元の送信者を取得
    address sender = _msgSender();
    require(block.timestamp >= lastWithdrawTime[sender] + lockTime, "Must wait 1 days between withdrawals");
    require(address(this).balance >= withdrawalAmount, "Faucet is empty");
		lastWithdrawTime[sender] = block.timestamp;
      
		// メタトランザクションによって元の送信者に送金
		(bool success, ) = payable(sender).call{value: withdrawalAmount}("");
		require(success, "Transfer failed");

		emit Withdrawal(sender, withdrawalAmount);
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