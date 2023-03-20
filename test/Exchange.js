const { expect } = require("chai");
const { ethers } = require("hardhat");

//Convert to gwei
const tokens = (n) => {
   return ethers.utils.parseUnits(n.toString(), "ether")
}

describe("Exchange", () => {
    let deployer, feeAccount, exchange, user1

    const feePercent = 10

    beforeEach(async ()=> {
        const Exchange = await ethers.getContractFactory("Exchange")
        const Token = await ethers.getContractFactory("Token")

        token1 = await Token.deploy("Dapp University", "DAPP",1000000)
        // We fetch the token from the BC
        accounts = await ethers.getSigners()
        deployer = accounts[0]
        feeAccount = accounts[1]
        user1 = accounts[2]

        //Distribute tokens to user1 so the depositing test works
        let transaction = await token1.connect(deployer).transfer(user1.address,tokens(100))
        await transaction.wait()

        //Deploy feeAccount and feePercent so they users pay a fee when using the contract
        exchange = await Exchange.deploy(feeAccount.address, feePercent)
    })
    describe("Deployment", () =>{
        it('it tracks the fee Account', async ()=>{
            expect(await exchange.feeAccount()).to.equal(feeAccount.address)
        })
        it('it tracks the fee percent', async ()=>{
            expect(await exchange.feePercent()).to.equal(feePercent)
        })
    })
    describe("Deposit Tokens", () =>{
        let transaction, result
        let amount = tokens(10)
        describe("Success", () => {
            beforeEach(async ()=> {
                //Approve Tokens
                transaction = await token1.connect(user1).approve(exchange.address, amount)
                result = await transaction.wait()
                
                //Deposit Token
                transaction = await exchange.connect(user1).depositToken(token1.address, amount)
                result = await transaction.wait()
            })
            it("Tracks the token deposit", async ()=>{
                expect(await token1.balanceOf(exchange.address)).to.equal(amount)
                expect(await exchange.tokens(token1.address, user1.address)).to.equal(amount)
                expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(amount)
            })
            it('Emit a deposit event', async () => {
                const event = result.events[1]
                // Change the 0 for a 1 coz there is too many events
                expect(event.event).to.equal('Deposit')
                const args = event.args
                expect(args.token).to.equal(token1.address)
                expect(args.user).to.equal(user1.address)
                expect(args.amount).to.equal(amount)
                expect(args.balance).to.equal(amount)
    
            })
        })
        describe("Failure", () => {
            it("Fails when no tokens are approve", async ()=>{
                await expect(exchange.connect(user1).depositToken(token1.address,amount)).to.be.reverted
            })
        })
    })
})
