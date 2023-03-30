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
    mapping(uint256 => _Order) public orders;
    uint256 public orderCount;
    mapping(uint256 => bool) public orderCancelled;

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

    event Order (
        uint256 id, 
        address user, 
        address tokenGet, 
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp 
        );
    
    event Cancel (
        uint256 id, 
        address user, 
        address tokenGet, 
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp 
        );

    struct _Order {
        uint256 id; // unique identifier for the order
        address user; // User who made the order
        address tokenGet; // address of the token they receive
        uint256 amountGet; //amount they receive
        address tokenGive; //Address of the token they give
        uint256 amountGive; // Amount they give
        uint256 timestamp; //When order was created
    }

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

    function makeOrder(
        address _tokenGet,
        uint256 _amountGet,
        address _tokenGive,
        uint256 _amountGive
    ) public {

        //Require token balance
        require(balanceOf(_tokenGive, msg.sender) >= _amountGive);
        //Add one to the id count 
        orderCount = orderCount +1;
        //Create the order and add it to the orders mapping
        orders[orderCount] = _Order(
            orderCount,
            msg.sender,
            _tokenGet,
            _amountGet,
            _tokenGive,
            _amountGive,
            block.timestamp
        );

        //Emit event
        emit Order (
            orderCount, 
            msg.sender, 
            _tokenGet, 
            _amountGet,
            _tokenGive,
            _amountGive,
            block.timestamp 
        );
    }
    function cancelOrder(uint256 _id) public{
        //Fetching order
        _Order storage _order = orders[_id];
        //Require event
        require(address(_order.user) == msg.sender);
        require(_order.id ==_id);
        //Cancel order
        //Store the order and change the bool element to true
        orderCancelled[_id] = true;
        //Emit event
         emit Cancel (
            _order.id, 
            msg.sender, 
            _order.tokenGet, 
            _order.amountGet,
            _order.tokenGive,
            _order.amountGive,
            block.timestamp 
        );
    }
}