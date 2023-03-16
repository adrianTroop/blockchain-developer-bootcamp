//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

//Dev 
import "hardhat/console.sol";

contract Exchange{
    address public feeAccount;
    uint256 public feePercent;

    constructor(address _feeAccount, uint256 _feePercent){
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }
    //Lets charge 10% for the fees when users use this contract.


}
