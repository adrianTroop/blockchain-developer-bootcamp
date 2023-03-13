const { expect } = require("chai");
const { ethers } = require("hardhat");

//Convert to gwei
const tokens = (n) => {
   return ethers.utils.parseUnits(n.toString(), "ether")
}

describe("Token", () => {
    let Token, accounts, deployer, receiver, exchange

    beforeEach(async ()=> {
        // We fetch the token from the BC
        const Token = await ethers.getContractFactory("Token")
        token = await Token.deploy("Dapp University", "DAPP",1000000)

        accounts = await ethers.getSigners()
        deployer = accounts[0]
        receiver = accounts[1]
        exchange = accounts[2]
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
        describe('Success', () => {
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
            it('Emit a transfer event', async () => {
                const event = result.events[0]
                expect(event.event).to.equal('Transfer')
                const args = event.args
                expect(args.from).to.equal(deployer.address)
                expect(args.to).to.equal(receiver.address)
                expect(args.value).to.equal(amount)
    
            })
        })
        describe('Failure', () => {
            it('Not Enough balance', async () =>{
                const invalidAmount = tokens(1000000000)
                await expect(token.connect(deployer).transfer(receiver.address, invalidAmount)).to.be.reverted
            })
            it('Rejects invalid recipent', async () =>{
                const amount = tokens(100)
                await expect(token.connect(deployer).transfer('0x0000000000000000000000000000000000000000', amount)).to.be.reverted
            })
        })
    })
    describe("Approving Tokens", () =>{
        let amount, transaction, result
        beforeEach(async () => {
            amount = tokens(100)
            transaction = await token.connect(deployer).approve(exchange.address, amount)
            result = await transaction.wait()
        })

        describe('Success', () => {
            // Allocates an amount for a specific account to spend and check if this is in the allownce array
            it('Allocates and allowance for delegated token spending', async () => {
                expect(await token.allowance(deployer.address, exchange.address)).to.equal(amount)
            } )
            //Check if an event is set up and triggered.
            it('Emit an Approval event', async () => {
                const event = result.events[0]
                expect(event.event).to.equal('Approval')
                const args = event.args
                expect(args.owner).to.equal(deployer.address)
                expect(args.spender).to.equal(exchange.address)
                expect(args.value).to.equal(amount)
    
            })
        })
        describe('Failure', () => {
            it('Rejects invalid spenders', async ()=>{
                await expect(token.connect(deployer).approve('0x0000000000000000000000000000000000000000', amount)).to.be.reverted
            })
        })
    })
  });