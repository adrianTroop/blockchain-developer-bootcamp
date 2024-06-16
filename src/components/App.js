import { useEffect } from 'react';
import { useDispatch } from 'react-redux'
import config from '../config.json'

import { loadProvider,
          loadNetwork,
          loadAccount,
          loadTokens,
          loadExchange,
          loadAllOrders,
          subscribeToEvents
       } from '../store/interactions';

import Navbar from './Navbar';
import Markets from './Markets';
import Balance from './Balance';
import Order from './Order';
import OrderBook from './OrderBook';
import Trades from './Trades';
import Transactions from './Transactions'
import PriceChart from './PriceChart';


function App() {

  const dispatch = useDispatch()

  //Connecting to the blockchain
  const loadBlockchainData = async () => {
    //Like this we dont get info straight from Bc we get it from Redux
    const provider = loadProvider(dispatch)
    //Breaking down values and fetching current networdk chainID 31337 kovan:42
    const chainId = await loadNetwork(provider,dispatch)

    window.ethereum.on('chainChanged', ()=>{
      window.location.reload()
    })
    //We pass the provider so we can load the balance from metamask
    //Whenever the metamask accounts change the page will get reloaded.
    window.ethereum.on('accountsChanged', () => {
      loadAccount(provider, dispatch)
    })

    
    //Load token contracts maybe i move the address to the const definition Still not sure
    const DApp = config[chainId].DApp.address
    const mEth = config[chainId].mETH.address
    await loadTokens(provider, [DApp,mEth], dispatch)
    
    const exchangeConfig = config[chainId].exchange
    const exchange = await loadExchange(provider,exchangeConfig.address,dispatch)

    //Fetch all orders: Open, filled and cancelled
    loadAllOrders(provider, exchange, dispatch)
  
    // We want to set up the subscribee event here to be able to use it on all the events so we set it up in the APP.js(Top element)
  
    //Subscribing to events Listening to events
    subscribeToEvents(exchange, dispatch)
  
  }

  useEffect(() => {
    loadBlockchainData() 
  })
  return (
    <div>

      <Navbar/>

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          < Markets />

          < Balance />

          < Order />

        </section>
        <section className='exchange__section--right grid'>

        < PriceChart />

          < Transactions />

          < Trades />

          < OrderBook />

        </section>
      </main>

      {/* Alert */}

    </div>
  );
}

export default App;
