//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

//Dev 
import "hardhat/console.sol";
//import the other contract to be able to use this contract on Exchange.sol
import "./Token.sol";

contract Exchange{
    address public feeAccount;
    uint256 public feePercent;
    //mapping of balances in exchange
    mapping(address => mapping(address => uint256)) public tokens;

    event Deposit(
        address token,
        address user,
        uint256 amount,
        uint256 balance);

    event Withdraw(
        address token,
        address user,
        uint256 amount,
        uint256 balance);

    constructor(address _feeAccount, uint256 _feePercent){
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }
    //Lets charge 10% for the fees when users use this contract.
    //Deposit tokens
    function depositToken(address _token, uint256 _amount) public{
        //Transfer token to exchange
        //Talk to the Token.sol contract
        require(Token(_token).transferFrom(msg.sender, address(this),_amount));
        //Update user balance
        tokens[_token][msg.sender] = tokens[_token][msg.sender] + _amount;
        //Emit an event
        emit Deposit(_token, msg.sender,_amount,tokens[_token][msg.sender]);
    }

    function withdrawToken(address _token, uint256 _amount) public {
        require(tokens[_token][msg.sender] >= _amount);
        //update user balance
        Token(_token).transfer(msg.sender, _amount);
        //Transfer token to the user
        tokens[_token][msg.sender] = tokens[_token][msg.sender] - _amount;
        //Emit Event
        emit Withdraw(_token, msg.sender,_amount,tokens[_token][msg.sender]);
    }

    //Check balances of tokens on users address
    function balanceOf(address _token, address _user) 
        public
        view
        returns (uint256)
    {
        return tokens[_token][_user];
    }
}
