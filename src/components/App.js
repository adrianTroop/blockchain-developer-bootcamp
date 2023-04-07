import { useEffect } from 'react';
import { ethers } from 'ethers';
import '../App.css';

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
