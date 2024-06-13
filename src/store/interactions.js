import { ethers } from 'ethers'
import TOKEN_ABI from '../abis/Token.json'
import EXCHANGE_ABI from '../abis/Exchange.json'
import { exchange, provider } from './reducers'

export const loadProvider = (dispatch) => {
    //connecting ethers to the BC
    const connection = new ethers.providers.Web3Provider(window.ethereum)
    //In Js you dont need to put the type the language already know.
    dispatch({type:'PROVIDER_LOADED', connection})
    return connection
}

export const loadNetwork = async (provider, dispatch) => {
    const { chainId } = await provider.getNetwork()
    dispatch({ type: 'NETWORK_LOADED', chainId})

    return chainId
}


export const loadAccount = async (provider, dispatch) => {
    const accounts = await window.ethereum.request({method : 'eth_requestAccounts'})
    const account = ethers.utils.getAddress(accounts[0])
    
    dispatch({ type : 'ACCOUNT_LOADED', account })
    //Had to change this as i think i probably changed this when i updated the other funciton.
    let balance = await provider.getBalance(account)
    //this returns the gwei amount but we want to pass it as Ether amount.
    balance = ethers.utils.formatEther(balance)
    dispatch({ type : 'ETHER_BALANCE_LOADED', balance})

    return account
}

export const loadTokens = async (provider, addresses, dispatch) => {
    let token, symbol
    token = new ethers.Contract(addresses[0], TOKEN_ABI, provider)
    symbol = await token.symbol()
    dispatch({type: 'TOKEN_1_LOADED', token, symbol})
    
    token = new ethers.Contract(addresses[1], TOKEN_ABI, provider)
    symbol = await token.symbol()
    dispatch({type: 'TOKEN_2_LOADED', token, symbol})

    return token
}

export const loadExchange = async (provider, address, dispatch) => {
    const exchange = new ethers.Contract(address, EXCHANGE_ABI, provider)
    dispatch({type: 'EXCHANGE_LOADED', exchange})

    return exchange
}

//Function that subscribe to events and get the confirmation from BC that transfers are succesful
export const subscribeToEvents = (exchange, dispatch)=>{
    //Subscribe to the event deposit and take all the values to check details
    exchange.on('Deposit', (token, user, amount, balance, event)=>{
        //Notify app that transfer was succesful
        dispatch({type : 'TRANSFER_SUCCESS', event})
    })
    exchange.on('Withdraw', (token, user, amount, balance, event)=>{
        //Notify app that transfer was succesful
        dispatch({type : 'TRANSFER_SUCCESS', event})
    })
    //We listening to the event and the function need to accept all the values from the event.
    exchange.on('Order', (id, user,tokenGet,amountGet,tokenGive,amountGive,timestamp,event) => {
        const order = event.args
        dispatch({type: 'NEW_ORDER_SUCCESS', order, event})
    })
}

//LOADS USER BALANCE (WALLET & EXCHANGE)
export const loadBalances = async (exchange, tokens, account, dispatch) => {
    let balance = ethers.utils.formatUnits(await tokens[0].balanceOf(account),18)
    //We use the same variable because we dispatch so we can re write the variable
    dispatch({type: 'TOKEN_1_BALANCE_LOADED', balance})
    balance = ethers.utils.formatUnits(await exchange.balanceOf(tokens[0].address, account),18)
    dispatch({type: 'EXCHANGE_TOKEN_1_BALANCE_LOADED', balance})

    //Second Token
    balance = ethers.utils.formatUnits(await tokens[1].balanceOf(account),18)
    dispatch({type: 'TOKEN_2_BALANCE_LOADED', balance})

    balance = ethers.utils.formatUnits(await exchange.balanceOf(tokens[1].address, account),18)
    dispatch({type: 'EXCHANGE_TOKEN_2_BALANCE_LOADED', balance})
}

////////////////////////////////////////////////////////////
//////////////  LOAD ALL ORDERS /////////////////////////////

export const loadAllOrders = async(provider, exchange, dispatch)
{
    const block = await provider.getBlockNumber()

    //Getting all order throught a query on the event so we can see all past orders.
    const orderStream = await exchange.queryFilter('Order', 0, block)
    const allOrders = orderStream.map(event => event.args)

    dispatch({type: 'ALL_ORDERS_LOADED', allOrders})
}


//Deposit and withdraws

// Transfer Tokens Deposit or Withdraw
export const transferTokens = async (provider, exchange, transferType, token, amount, dispatch) => {
    let transaction
    
    dispatch({ type: 'TRANSFER_REQUEST' })

    try{
        //They need to approve tokens and then sedn them.
        //User will be the signer
        const signer = await provider.getSigner()
        const amountToTransfer = ethers.utils.parseUnits(amount.toString(),18)
        if(transferType === 'Deposit'){
            transaction = await token.connect(signer).approve(exchange.address, amountToTransfer)
            await transaction.wait()
            transaction = await exchange.connect(signer).depositToken(token.address, amountToTransfer)
        }else{
            transaction = await exchange.connect(signer).withdrawToken(token.address, amountToTransfer)
        }   
        await transaction.wait()
    }catch(error){
        dispatch({type: 'TRANSFER_FAIL'})
    }

}

////////// ORDERS BUY AND SELL /////////////////

export const makeBuyOrder = async (provider,exchange, tokens, order, dispatch) => {
    //Make orders
    /*
    address _tokenGet,
    uint256 _amountGet,
    address _tokenGive,
    uint256 _amountGive (orderAmount * orderPrice)
    */
    const tokenGet = tokens[0].address
    const amountGet = ethers.utils.parseUnits(order.amount,18)
    const tokenGive = tokens[1].address
    const amountGive = ethers.utils.parseUnits((order.amount * order.price).toString() ,18)
    dispatch({type: 'NEW_ORDER_REQUEST'})
    
    try{
        const signer = await provider.getSigner()
        // the name Makebuy order is a function in exchange
        const transaction = await exchange.connect(signer).makeOrder(tokenGet, amountGet, tokenGive, amountGive)
        await transaction.wait()
    } catch(error) {
        dispatch({type: 'NEW_ORDER_FAIL'})
    } 
}

//SELL ORDER 
export const makeSellOrder = async (provider,exchange, tokens, order, dispatch) => {
    //Make orders
    /*
    address _tokenGet,
    uint256 _amountGet,
    address _tokenGive,
    uint256 _amountGive (orderAmount * orderPrice)
    */
    const tokenGet = tokens[1].address
    const amountGet = ethers.utils.parseUnits((order.amount * order.price).toString() ,18)
    const tokenGive = tokens[0].address
    const amountGive = ethers.utils.parseUnits(order.amount,18)
    dispatch({type: 'NEW_ORDER_REQUEST'})
    
    try{
        const signer = await provider.getSigner()
        // the name Makebuy order is a function in exchange
        const transaction = await exchange.connect(signer).makeOrder(tokenGet, amountGet, tokenGive, amountGive)
        await transaction.wait()
    } catch(error) {
        dispatch({type: 'NEW_ORDER_FAIL'})
    } 
}
