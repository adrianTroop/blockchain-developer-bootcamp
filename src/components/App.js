import { useEffect } from 'react';
import { ethers } from 'ethers';
import TOKEN_ABI from '../abis/Token.json'
import EXCHANGE_ABI from '../abis/Exchange.json'
import config from '../config.json'

function App() {

  

  //Connecting to the blockchain
  const loadBlockchainData = async () => {
    const accounts = await window.ethereum.request({method : 'eth_requestAccounts'})
    console.log(accounts[0])
    //connecting ethers to the BC
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    //Breaking down values 
    const {chainId} = await provider.getNetwork()
    console.log(chainId)

    const DappToken = new ethers.Contract(config[chainId].Dapp.address, TOKEN_ABI, provider)
    console.log(await DappToken.symbol())
    console.log(await DappToken.address)
  }

  useEffect(() => {
    loadBlockchainData() 

    //more
  })
  return (
    <div>

      {/* Navbar */}

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          {/* Markets */}

          {/* Balance */}

          {/* Order */}

        </section>
        <section className='exchange__section--right grid'>

          {/* PriceChart */}

          {/* Transactions */}

          {/* Trades */}

          {/* OrderBook */}

        </section>
      </main>

      {/* Alert */}

    </div>
  );
}

export default App;
