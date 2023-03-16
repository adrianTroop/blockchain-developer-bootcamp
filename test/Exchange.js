const { expect } = require("chai");
const { ethers } = require("hardhat");

//Convert to gwei
const tokens = (n) => {
   return ethers.utils.parseUnits(n.toString(), "ether")
}

describe("Exchange", () => {
    let deployer, feeAccount, exchange

    const feePercent = 10

    beforeEach(async ()=> {
        // We fetch the token from the BC
        accounts = await ethers.getSigners()
        deployer = accounts[0]
        feeAccount = accounts[1]

        const Exchange = await ethers.getContractFactory("Exchange")
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
})
