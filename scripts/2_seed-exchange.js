const { ethers } = require("hardhat");

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), "ether")
}

const wait = (seconds) => {
    const milliseconds = seconds *1000
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

async function main() {
    //get accounts
    const  accounts = await ethers.getSigners()
    //Fetched tokens
    const Dapp = await ethers.getContractAt('Token', '0x5FbDB2315678afecb367f032d93F642f64180aa3')
    console.log(`Dapp token fetched: ${Dapp.address}\n`)

    const mETH = await ethers.getContractAt('Token', '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512')
    console.log(`Dapp token fetched: ${mETH.address}\n`)

    const mDAI = await ethers.getContractAt('Token', '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0')
    console.log(`Dapp token fetched: ${mDAI.address}\n`)

    const exchange = await ethers.getContractAt('Exchange', '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9')
    console.log(`Dapp token fetched: ${exchange.address}\n`)
    
    //Implement sender and receiver
    const sender = accounts[0]
    const receiver = accounts[1]
    let amount = tokens(10000)

    //Give tokens to account 1

    let transaction, result
    // send 10000 mETH from account 0 to 1
    transaction = await mETH.connect(sender).transfer(receiver.address, amount)
    console.log(`Transferred ${amount} tokens from ${sender.address} to ${receiver.address} \n`)
    
    //Deposit tokens to exchange
    const user1 = accounts[0]
    const user2 = accounts[1]
    amount = tokens(10000)

    //user 1 deposit 1000 Dapp into the exchange
    transaction = await Dapp.connect(user1).approve(exchange.address, amount)
    result = await transaction.wait()
    transaction = await exchange.connect(user1).depositToken(Dapp.address, amount)
    result = await transaction.wait()
    console.log(`${user1.address} depostied ${amount} into ${exchange.address}\n`)

    //user 2 deposit 1000 mETH into the exchange
    transaction = await mETH.connect(user2).approve(exchange.address, amount)
    result = await transaction.wait()
    transaction = await exchange.connect(user2).depositToken(mETH.address, amount)
    result = await transaction.wait()
    console.log(`${user2.address} depostied ${amount} into ${exchange.address}\n`)

    //////////////////////////////////////////////////
    //Make and cancel orders
    let orderId 
    transaction = await exchange.connect(user1).makeOrder(mETH.address,tokens(100),Dapp.address, tokens(5))
    result = await transaction.wait()
    console.log(`Made order from ${user1.address}\n`)
    // Cancel order
    orderId = result.events[0].args.id 
    transaction = await exchange.connect(user1).cancelOrder(orderId)
    result = await transaction.wait()
    console.log(`Cancelled order from ${user1.address}\n`)

    //WAIT

    await wait(1)
    //user1 makes another order
    transaction = await exchange.connect(user1).makeOrder(mETH.address,tokens(50),Dapp.address, tokens(15))
    result = await transaction.wait()
    console.log(`Made order from ${user1.address}\n`)
    
    orderId = result.events[0].args.id
    transaction = await exchange.connect(user2).fillOrder(orderId)
    result = await transaction.wait()
    console.log(`Filled order from ${user2.address}\n`)

    //CREATE MORE ORDERS TO PRACTISE
    await wait(1)

    for(i=0;i<10;i++){
        transaction = await exchange.connect(user1).makeOrder(mETH.address,tokens(10*i),Dapp.address, tokens(10*i))
        result = await transaction.wait()
        console.log(`Made order ${i} from ${user1.address}\n`)
        await wait(1)
    }

    for(i=0;i<10;i++){
        transaction = await exchange.connect(user2).makeOrder(Dapp.address,tokens(10*i),mETH.address, tokens(10*i))
        result = await transaction.wait()
        console.log(`Made order ${i} from ${user2.address}\n`)
        await wait(1)
    }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
