# On Chain Inheritence Smart Contract

## Description
The Inheritance Smart Contract is a blockchain-based solution implemented with solidity, designed to automate the process of transferring digital assets to an heir if the original owner does not perform a withdrawal within a specified period. The contract is developed in Solidity and is intended for deployment on the any Ethereum based networks.


## Features
-> *Owner Withdrawals:* The owner can withdraw ETH from the contract at any time.
-> *Inactivity Trigger:* If the owner does not withdraw ETH for more than 1 month, the designated heir can claim ownership.
-> *Heir Designation: The heir can be designated by the owner and can also change the successor heir.
-> *Event Logging:* The contract emits events for withdrawals, ownership transfers, heir changes, and received funds for transparency and trackability.

## Setup and Installation
Before deploying the contract, make sure you have the following:

-> Node.js installed.
-> A wallet with Ether for deploying the contract.
-> Truffle Suite or Hardhat for compiling and deploying.

## Usage
To use this contract, follow these steps:

-> *Compile the Contract:* Compile the contract using your Ethereum development tools.
-> *Deploy the Contract:* Deploy the contract to the Ethereum network. Upon deployment, specify the initial heir.
-> *Withdraw Funds:* As the owner, call withdraw to remove funds or reset the inactivity timer.
-> *Check Inheritance:* As the heir, you can call checkInheritance to claim ownership if the owner has been inactive for more than 1 month.
-> *Designate New Heir:* As the current heir, use designateNewHeir to set a successor heir.


