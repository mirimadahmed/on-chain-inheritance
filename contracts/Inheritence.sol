// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Inheritance {
    address public owner;
    address public heir;
    uint256 public lastWithdrawal;

    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );
    event HeirChanged(address indexed previousHeir, address indexed newHeir);
    event Withdrawal(address indexed by, uint256 amount);
    event FundsReceived(address indexed from, uint256 amount);

    constructor(address _heir) {
        require(_heir != address(0), "Heir cannot be the zero address.");
        require(_heir != msg.sender, "Heir cannot be the owner.");
        
        owner = msg.sender;
        heir = _heir;
        lastWithdrawal = block.timestamp;
    }

    receive() external payable {
        emit FundsReceived(msg.sender, msg.value);
    }

    fallback() external payable {
        emit FundsReceived(msg.sender, msg.value);
    }
}
