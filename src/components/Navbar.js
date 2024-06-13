
import { useSelector, useDispatch } from 'react-redux'
import Blockies from 'react-blockies'

import eth from '../assets/eth.svg'
import logo from '../assets/logo.png'

import { loadAccount } from '../store/interactions'

import config from '../config.json'

////////////////////////////////////////////////////////////////////
/* SELECT DOESNT WORK WHEN YOU CHANGE TO A POS NETWORK AND IT DOESNT UPDATE THE STATE PROBABLY AND THE PAGE DOESNT LOAD


YOU NEED TO LOOK INTO THIS!!!


*/

const Navbar = () => {

    //import info from REDUX with Hooks
    //Basically you get info from the Redux Database
    const provider = useSelector(state => state.provider.connection)
    const chainId = useSelector(state => state.provider.chainId)
    const account = useSelector(state => state.provider.account)
    const balance = useSelector(state => state.provider.balance)
    
    const dispatch = useDispatch()

    const connectHandler = async () => {
        await loadAccount(provider, dispatch)
    }

    const networkHandler = async (e) => {
        const newNetwork = e.target.value;
        //Network option hanlder take the event value and let us know what network is it
        await window.ethereum.request({
            //Built in function to request change network
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: newNetwork}]
        })
    }

    return(
      <div className='exchange__header grid'>
        <div className='exchange__header--brand flex'>
            <img src={ logo } className='logo' alt='DApp Logo'></img>
            <h1>Token Exchange</h1>
        </div>
  
        <div className='exchange__header--networks flex'>
            <img src={eth} alt='ETH LOGO' className='Eth Logo'></img>

            { chainId && (
                <select name='networks' id='networks' value={config[chainId] ? `0x${chainId.toString(16)}` : `0`} onChange={ networkHandler }>
                    <option value="0" disabled>Select Network</option>
                    <option value="0x7A69">Localhost</option>
                    <option value="0xaa36a7">Sepolia</option>
                </select>
            )
            }
        </div>

        <div className='exchange__header--account flex'>
            { balance ? (
                <p><small> My Balance</small>{ Number(balance).toFixed(4) }</p>
            ) : (
                <p><small> My balance </small> 0 ETH </p>
            )}
            { account ? (
                <a 
                 href={config[chainId] ? `${config[chainId].explorerURL}/address/${account}` : "#"}
                 target='_blank'
                 rel='noreferrer'
                > 
                {(account.slice(0,5) + '...' + account.slice(-4)) }
                <Blockies
                seed = { account }
                size={10}
                scale={3}
                color='#2187D0'
                bgColor='#F1F2F9'
                spotColor='#767F92'
                className='identicon'
                />
                </a>
            ) : (
                <button className='button' onClick={ connectHandler }>Connect</button>
            )}
            
        </div>
      </div>
    )
  }
  
  export default Navbar;
