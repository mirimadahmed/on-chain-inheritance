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

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function.");
        _;
    }

    modifier onlyHeir() {
        require(msg.sender == heir, "Only the heir can call this function.");
        _;
    }

    function withdraw(uint256 _amount) public onlyOwner {
        require(
            address(this).balance >= _amount,
            "Insufficient balance in contract."
        );

        if (_amount > 0) {
            (bool sent, ) = payable(owner).call{value: _amount}("");
            require(sent, "Failed to send Ether");
            emit Withdrawal(msg.sender, _amount);
        }
        lastWithdrawal = block.timestamp;
    }

    function designateNewHeir(address _newHeir) public onlyHeir {
        require(
            block.timestamp - lastWithdrawal > 30 days,
            "The withdrawal period has not expired."
        );
        require(_newHeir != address(0), "New heir cannot be the zero address.");
        require(_newHeir != owner, "New heir cannot be the current owner.");
        require(_newHeir != heir, "New heir cannot be the current heir.");

        owner = heir;
        heir = _newHeir;
        emit OwnershipTransferred(owner, heir);
        emit HeirChanged(heir, _newHeir);
    }

    receive() external payable {
        emit FundsReceived(msg.sender, msg.value);
    }

    fallback() external payable {
        emit FundsReceived(msg.sender, msg.value);
    }
}
