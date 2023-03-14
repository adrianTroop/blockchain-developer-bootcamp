//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

//Dev 
import "hardhat/console.sol";

contract Token{
    string public name;
    string public symbol;
    uint256 public decimals = 18;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    //Nested array the address has a list of approve address and the amounts inside.
    mapping(address => mapping(address => uint256)) public allowance;

    //Events send notifications to the Bc as its required
    event Transfer(
        address indexed from,
        address indexed to,
        uint256 value
        );
    
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
        );

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply
        ){
        name = _name;
        symbol = _symbol;
        totalSupply = _totalSupply * (10**decimals);
        balanceOf[msg.sender] = totalSupply;
    }

    function transfer(address _to, uint256 _value) 
        public 
        returns (bool success){
        //Check if the account has enough tokens with require its sort of an IF
        require(balanceOf[msg.sender] >= _value);

        _transfer(msg.sender, _to, _value);

        return true;
    }

    function _transfer(
        address _from,
        address _to,
        uint256 _value) internal{
        require(_to != address(0));

        balanceOf[_from] = balanceOf[_from] - _value;
        balanceOf[_to] = balanceOf[_to] + _value;
    
        emit Transfer(_from, _to, _value);
    }

    function approve(address _spender, uint256 _value)
        public 
        returns (bool success){
            require(_spender != address(0));    

            allowance[msg.sender][_spender] = _value;
            //Emit event to the BC to check the mov.
            emit Approval(msg.sender, _spender, _value);
            return true; 
        }
    function transferFrom(address _from, address _to, uint256 _value)
        public 
        returns (bool success){
            //Checking if the _from value is authorised to spend tokens from that account.
            require(_value <= allowance[_from][msg.sender]);
            require(_value <= balanceOf[_from]);

            //Reset allowance
            allowance[_from][msg.sender] = allowance[_from][msg.sender] - _value;

            _transfer(_from, _to, _value);
            return true;
    }
 
}
