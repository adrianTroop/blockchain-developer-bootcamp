const { expect } = require("chai");
const { ethers } = require("hardhat");

//Convert to gwei
const tokens = (n) => {
   return ethers.utils.parseUnits(n.toString(), "ether")
}

describe("Token", () => {
    let Token, accounts, deployer, receiver

    beforeEach(async ()=> {
        // We fetch the token from the BC
        const Token = await ethers.getContractFactory("Token")
        token = await Token.deploy("Dapp University", "DAPP",1000000)

        accounts = await ethers.getSigners()
        deployer = accounts[0]
        receiver = accounts[1]
    })
    describe("Deployment", () =>{
        const name = "Dapp University"
        const symbol = "DAPP"
        const decimals = "18"
        const totalSupply = tokens("1000000")

        it('Has Correct name', async ()=>{
            expect(await token.name()).to.equal(name)
        })
        it('Has Correct Symbol', async ()=>{
            expect(await token.symbol()).to.equal(symbol)
        })
        it('Has Correct Decimal', async ()=>{
            expect(await token.decimals()).to.equal(decimals)
        })
        it('Has Correct total supply', async ()=>{
            expect(await token.totalSupply()).to.equal(totalSupply)
        })
        it('Assigns total supply to deployer', async () =>{
            expect(await token.balanceOf(deployer.address)).to.equal(totalSupply)
        })
    })
    describe("Sending Tokens", () =>{
        let amount, transaction, result

        beforeEach(async () => {
            amount = tokens(100)
            transaction = await token.connect(deployer).transfer(receiver.address, amount)
            result = await transaction.wait()
        })
        it('Transfers Token balance', async () => {
            //connect to the blockchain
            //Check balance
            expect(await token.balanceOf(deployer.address)).to.equal(tokens(999900))
            expect(await token.balanceOf(receiver.address)).to.equal(amount)
        })
    })
  });