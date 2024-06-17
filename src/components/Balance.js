import { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector  } from 'react-redux'

import dapp from '../assets/dapp.svg'
import eth from '../assets/eth.svg'
//trigger those
import { loadBalances,
         transferTokens
} from '../store/interactions';

const Balance = () => {
    const [isDeposit, setIsDeposit ] = useState(true)
    //Putting the amount field into the redux store to be able to use. USE HOOK
    const [token1TransferAmount, setToken1TransferAmount] = useState(0)
    const [token2TransferAmount, setToken2TransferAmount] = useState(0)

    const dispatch = useDispatch()
    
    const provider = useSelector(state => state.provider.connection)

    //Import symbols from Redux Store
    const account = useSelector(state => state.provider.account)
     
    const exchange = useSelector(state => state.exchange.contract)
    const exchangeBalances = useSelector(state => state.exchange.balances)
    const transferInProgress = useSelector(state => state.exchange.transferInProgress)
    
    //Import symbols from Redux 
    const symbols = useSelector(state => state.tokens.symbols)
    const tokens = useSelector(state => state.tokens.contracts)
    
    const tokenBalances = useSelector(state => state.tokens.balances)
    
    const depositRef = useRef(null)
    const withdrawRef = useRef(null)


    const tabHandler = (e) => {
        //Handles the tab and updates buttons
        if(e.target.className !== depositRef.current.className ){
            e.target.className = 'tab tab--active'
            depositRef.current.className = 'tab'
            setIsDeposit(false)

        } else{
            e.target.className = 'tab tab--active'
            withdrawRef.current.className = 'tab'
            setIsDeposit(true)
        }
    }

    //TOKEN 0
    const amountHandler = (e, token) =>{
        if(token.address === tokens[0].address){
            setToken1TransferAmount(e.target.value)
        }else{
            setToken2TransferAmount(e.target.value)
        }
    }

    //[x]Step 1: do transfer
    //[x]Step 2: Notify app that transfer is pending
    //[x]Step 3: Get confirmation from blockchain that transfer was succesful
    //[x]Step 4: Notify app that transfer was succesful
    //[]Step 5: Handle transfer fails - notify app



    const depositHandler = (e, token) => {
        //prevents the page from refreshing
        e.preventDefault()
        if(token.address === tokens[0].address){
            transferTokens(provider, exchange, 'Deposit', token, token1TransferAmount, dispatch)
            setToken1TransferAmount(0)
        }else{
            transferTokens(provider, exchange, 'Deposit', token, token2TransferAmount, dispatch)
            setToken2TransferAmount(0)
        }
    }
    const withdrawHandler = (e, token) => {
        e.preventDefault()
        if(token.address === tokens[0].address){
            transferTokens(provider, exchange, 'Withdraw', token, token1TransferAmount, dispatch)
            setToken1TransferAmount(0)
        }else{
            transferTokens(provider, exchange, 'Withdraw', token, token2TransferAmount, dispatch)
            setToken2TransferAmount(0)
        }
    }

    useEffect(()=>{
        //Make sure the values are there before we call them 
        if(exchange && tokens[0] && tokens[1] && account){
            loadBalances(exchange, tokens, account, dispatch)
        } 
        //If any of this reload the page again dispatch need?
    }, [exchange, tokens, account, dispatch, transferInProgress, dispatch])

    return ( 
      <div className='component exchange__transfers'>
        <div className='component__header flex-between'>
          <h2>Balance</h2>
          <div className='tabs'>
            {/* Tabs */}
            <button onClick={ (e) => tabHandler(e) } ref={ depositRef } className='tab tab--active'>Deposit</button>
            <button onClick={ tabHandler } ref={withdrawRef} className='tab'>Withdraw</button>
          </div>
        </div>

        {/* Deposit/Withdraw Component 1 [0] (DApp) */}
  
        <div className='exchange__transfers--form'>
          <div className='flex-between'>
            <p><small>Token</small><br /><img src={ dapp } alt='Token Logo' />{ symbols && symbols[0] }</p>
            <p><small>Wallet</small><br />{ tokenBalances && tokenBalances[0] }</p>
            <p><small>Exchange</small><br />{ exchangeBalances && exchangeBalances[0] }</p>
          </div>
          <form onSubmit={ isDeposit ? (e) => depositHandler(e,tokens[0]) : (e) => withdrawHandler(e,tokens[0]) }>
            <label htmlFor="token0">{ symbols && symbols[0]} Amount</label>
            <input 
                type="text"
                id='token0'
                placeholder='0.0000'
                value={token1TransferAmount === 0 ? '' : token1TransferAmount}
                onChange={(e) => amountHandler(e, tokens[0])}/>
  
            <button className='button' type='submit'>
                {isDeposit ? (<span> Deposit </span>): (<span> Withdraw </span>)}
            </button>
          </form>
        </div>
  
        <hr />
  
        {/* Deposit/Withdraw Component 2 [1] (mETH) */}
  
        <div className='exchange__transfers--form'>
          <div className='flex-between'>
            <p><small>Token</small><br /><img src={ eth } alt='Token Logo' />{ symbols && symbols[1] }</p>
            <p><small>Wallet</small><br />{ tokenBalances && tokenBalances[1] }</p>
            <p><small>Exchange</small><br />{ exchangeBalances && exchangeBalances[1] }</p>
          </div>
  
          <form onSubmit={isDeposit ? (e) => depositHandler(e,tokens[1]) : (e) => withdrawHandler(e,tokens[1] )}>
            <label htmlFor="token1">{ symbols && symbols[1]} Amount</label>
            <input 
                type="text"
                id='token1' 
                placeholder='0.0000'
                value={token2TransferAmount === 0 ? '' : token2TransferAmount}
                onChange={(e) => amountHandler(e, tokens[1])}
            />
  
            <button className='button' type='submit'>
                {/* Changes the text on the buttons depending the state */}
                {isDeposit ? (<span> Deposit </span>): (<span> Withdraw </span>)}
            </button>
          </form>
        </div>
  
        <hr />
      </div>
    );
  }
  
  export default Balance;
