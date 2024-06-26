const { expect } = require("chai");
const { ethers } = require("hardhat");
//const { result } = require("lodash");

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
        token2 = await Token.deploy("Mock Dai", "mDAI",1000000)
        // We fetch the token from the BC
        accounts = await ethers.getSigners()
        deployer = accounts[0]
        feeAccount = accounts[1]
        //users
        user1 = accounts[2]
        user2 = accounts[3]

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
                
                //Deposit Token to the user from exchange so doesnt show an error
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
            //Trying to send tokens without approving
            it("Fails when no tokens are approve", async ()=>{
                await expect(exchange.connect(user1).depositToken(token1.address,amount)).to.be.reverted
            })
        })
    })
    describe("Withdraw Tokens", () =>{
        let transaction, result
        let amount = tokens(10)
        describe("Success", () => {
            beforeEach(async ()=> {
                //Deposit tokens so the user can withdraw
                //Approve Tokens
                transaction = await token1.connect(user1).approve(exchange.address, amount)
                result = await transaction.wait()
                
                //Deposit Token
                transaction = await exchange.connect(user1).depositToken(token1.address, amount)
                result = await transaction.wait()
                transaction = await exchange.connect(user1).withdrawToken(token1.address, amount)
                result = await transaction.wait()
            })
            it("Withdraw token funds", async ()=>{
                expect(await token1.balanceOf(exchange.address)).to.equal(0)
                expect(await exchange.tokens(token1.address, user1.address)).to.equal(0)
                expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(0)
            })
            it('Emit a deposit event', async () => {
                const event = result.events[1]
                // Change the 0 for a 1 coz there is too many events
                expect(event.event).to.equal('Withdraw')
                const args = event.args
                expect(args.token).to.equal(token1.address)
                expect(args.user).to.equal(user1.address)
                expect(args.amount).to.equal(amount)
                expect(args.balance).to.equal(0)
    
            })
        })
        describe("Failure", () => {
            it("Fails for insufficent balance", async ()=>{
                //attemps to withdraw tokens without depositing
                await expect(exchange.connect(user1).withdrawToken(token1.address,amount)).to.be.reverted
            })
        })
    })
    describe("Checking balances ", () =>{
        let transaction, result
        let amount = tokens(1)
        beforeEach(async ()=> {
            //Deposit tokens so the user can withdraw
            //Approve Tokens
            transaction = await token1.connect(user1).approve(exchange.address, amount)
            result = await transaction.wait()
                
                //Deposit Token
            transaction = await exchange.connect(user1).depositToken(token1.address, amount)
            result = await transaction.wait()
        })
        it("Returns user balance", async ()=>{
            expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(amount)
        })
    })
    describe('Making orders', () =>{
        let transaction, result
        let amount = tokens(1)
        describe('Success', async () =>{
            beforeEach(async ()=>{
                //we approve tokens and deposit token so the user has tokens to make the order
                transaction = await token1.connect(user1).approve(exchange.address, amount)
                result = await transaction.wait()

                transaction = await exchange.connect(user1).depositToken(token1.address,amount)
                result = await transaction.wait()

                transaction = await exchange.connect(user1).makeOrder(token2.address,amount,token1.address,amount)
                result = await transaction.wait()
            })
            it('Tracks the newly created order', async () => {
                expect(await exchange.orderCount()).to.equal(1)
            })
            it('Emit a order event', async () => {
                const event = result.events[0]
                // Change the 0 for a 1 coz there is too many events
                expect(event.event).to.equal('Order')

                const args = event.args
                expect(args.id).to.equal(1)
                expect(args.user).to.equal(user1.address)
                expect(args.tokenGet).to.equal(token2.address)
                expect(args.amountGet).to.equal(tokens(1))
                expect(args.tokenGive).to.equal(token1.address)
                expect(args.amountGive).to.equal(tokens(1))
                expect(args.timestamp).to.at.least(1)
            })  
        })
        describe('Failure', async () =>{
            it('Rejects order that has no balance', async () =>{
                expect(exchange.connect(user1).makeOrder(token2.address, tokens(1), token1.address, tokens(1))).to.be.reverted
            })
        })
    })
    describe('Order actions', async () =>{
        let transaction, result
        let amount = tokens(1)

        beforeEach(async () =>{
            //user1 deposti tokens
            transaction = await token1.connect(user1).approve(exchange.address, amount)
            result = await transaction.wait()

            transaction = await exchange.connect(user1).depositToken(token1.address, amount)
            result = await transaction.wait()

            // Give user2 some tokens
            transaction = await token2.connect(deployer).transfer(user2.address, tokens(100))
            result = await transaction.wait()

            //user2 deposit tokens
            transaction = await token2.connect(user2).approve(exchange.address, tokens(2))
            result = await transaction.wait()

            //user 2 Deposit token
            transaction = await exchange.connect(user2).depositToken(token2.address, tokens(2))
            result = await transaction.wait()

            //Make order
            transaction = await exchange.connect(user1).makeOrder(token2.address, amount, token1.address, amount)
            result = await transaction.wait()

        })

        describe('Cancelling orders', async () =>{
            describe('Success', async () =>{
                beforeEach(async () =>{
                    transaction = await exchange.connect(user1).cancelOrder(1)
                    result = await transaction.wait()
                })
                it('Updates cancelled orders', async () =>{
                    expect(await exchange.orderCancelled(1)).to.equal(true)
                })
                it('Emit a Cancellation event', async () => {
                    const event = result.events[0]
                    // Change the 0 for a 1 coz there is too many events
                    expect(event.event).to.equal('Cancel')
    
                    const args = event.args
                    expect(args.id).to.equal(1)
                    expect(args.user).to.equal(user1.address)
                    expect(args.tokenGet).to.equal(token2.address)
                    expect(args.amountGet).to.equal(tokens(1))
                    expect(args.tokenGive).to.equal(token1.address)
                    expect(args.amountGive).to.equal(tokens(1))
                    expect(args.timestamp).to.at.least(1)
                })  
            })
            describe('Failure', async() =>{
                beforeEach(async () =>{
                    transaction = await token1.connect(user1).approve(exchange.address, amount)
                    result = await transaction.wait()
                    transaction = await exchange.connect(user1).depositToken(token1.address, amount)
                    result = await transaction.wait()
                    transaction = await exchange.connect(user1).makeOrder(token2.address, amount, token1.address, amount)
                    result = await transaction.wait()
                })
                it('Rejects invalid order ids', async () =>{ 
                    const invalidOrder = 9999
                    await expect(exchange.connect(user1).cancelOrder(invalidOrder)).to.be.reverted
                })
                it('Reject unauthorized cancelations', async () =>{
                    await expect(exchange.connect(user2).cancelOrder(1)).to.be.reverted
                })
            })
        })
        describe('Filling orders', async () =>{
            describe('Success', async () =>{
                beforeEach(async () =>{
                    transaction = await exchange.connect(user2).fillOrder('1')
                    result = await transaction.wait()
                })
                it('Executes the trade and charge fees', async () => {
                    //Ensure the trade happens
                    //Check balance token give
                    expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(tokens(0))
                    expect(await exchange.balanceOf(token1.address, user2.address)).to.equal(tokens(1))
                    expect(await exchange.balanceOf(token1.address, feeAccount.address)).to.equal(tokens(0))
                    //balance token Get
                    expect(await exchange.balanceOf(token2.address, user1.address)).to.equal(tokens(1))
                    expect(await exchange.balanceOf(token2.address, user2.address)).to.equal(tokens(0.9))
                    expect(await exchange.balanceOf(token2.address, feeAccount.address)).to.equal(tokens(0.1))
    
                })
                it('Updates order filled', async ()=>{
                    expect(await exchange.orderFilled(1)).to.equal(true)
                })
                it('Emit a trade event', async () => {
                    const event = result.events[0]
                    // Change the 0 for a 1 coz there is too many events
                    expect(event.event).to.equal('Trade')
    
                    const args = event.args
                    expect(args.id).to.equal(1)
                    expect(args.user).to.equal(user2.address)
                    expect(args.tokenGet).to.equal(token2.address)
                    expect(args.amountGet).to.equal(tokens(1))
                    expect(args.tokenGive).to.equal(token1.address)
                    expect(args.amountGive).to.equal(tokens(1))
                    expect(args.creator).to.equal(user1.address)
                    expect(args.timestamp).to.at.least(1)
                }) 
            })
            describe('Failure', async () =>{
                it('Rejects invalid order ids', async () =>{
                    const invalidOrderId = 99999
                    await expect(exchange.connect(user2).fillOrder(invalidOrderId)).to.be.reverted
                })
                it('Rejects already filled orders', async () => {
                    transaction = await exchange.connect(user2).fillOrder(1)
                    await transaction.wait()
                    // we fill an order then we try to fill another 
                    await expect(exchange.connect(user2).fillOrder(1)).to.be.reverted
                })
                it('Rejects cancelled orders', async () => {
                    transaction = await exchange.connect(user1).cancelOrder(1)
                    await transaction.wait()
                    //We cancel the transaction and we try to fill it again
                    await expect(exchange.connect(user1).fillOrder(1)).to.be.reverted
                })
            })
        })
    })
})
