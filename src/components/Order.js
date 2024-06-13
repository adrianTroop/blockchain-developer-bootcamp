import { useRef, useState } from "react";
import { useSelector, useDispatch } from 'react-redux'

import { makeBuyOrder, makeSellOrder } from "../store/interactions";

const Order = () => {
    //Same as Balance to keep the amount
    //Check if we have a buy or a sell order
    const [isBuy, setIsBuy] = useState(true)
    const [amount, setAmount] = useState(0)
    const [price, setPrice] = useState(0)

    //DATA TO MAKE THE ORDER
    const provider = useSelector(state => state.provider.connection)
    const tokens = useSelector(state => state.tokens.contracts)
    const exchange = useSelector(state => state.exchange.contract)
    const dispatch = useDispatch()

    const buyRef = useRef(null)
    const sellRef = useRef(null)

    //Remember to connect the onClick event so it updates the ref from Buy to sell
    const tabHandler = (e) => {
      //Handles the tab and updates buttons
      if(e.target.className !== buyRef.current.className ){
          e.target.className = 'tab tab--active'
          buyRef.current.className = 'tab'
          setIsBuy(false)

      } else{
          e.target.className = 'tab tab--active'
          sellRef.current.className = 'tab'
          setIsBuy(true)
      }
  }

    const buyHandler = (e) => {
      //Connects to BC to make the orders
      e.preventDefault()
      //Creates a buy order
      //We calling the makebuy order when we press the button
      //We setting the order based on amount and price from the variables as an object.
      makeBuyOrder(provider, exchange, tokens, {amount, price}, dispatch)
      setAmount(0)
      setPrice(0)
    }

    const sellHandler = (e) => {
      e.preventDefault()
      //Creates a sell order
      console.log("SELL")
      makeSellOrder(provider, exchange, tokens, {amount, price}, dispatch)
      setAmount(0)
      setPrice(0)
    }

    return (
      <div className="component exchange__orders">
        <div className='component__header flex-between'>
          <h2>New Order</h2>
          <div className='tabs'>
            <button onClick={tabHandler} ref={buyRef} className='tab tab--active'>Buy</button>
            <button onClick={tabHandler} ref={sellRef} className='tab'>Sell</button>
          </div>
        </div>
  
        <form onSubmit={ isBuy ? buyHandler : sellHandler }>
        
          {isBuy ? (
            <label htmlFor="amount">Buy Amount</label>
          ) : (
            <label htmlFor="amount">Sell Amount</label>
          )}

          <input 
            type="text"
            id='amount' 
            placeholder='0.0000'
            value={amount === 0 ? '' : amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          
          {isBuy ? (
            <label htmlFor="price">Buy Price</label>
          ) : (
            <label htmlFor="price">Sell Price</label>
          )}
  
          <input 
            type="text" 
            id='price' 
            placeholder='0.0000'
            value={price === 0 ? '' : price}
            onChange={(e) => setPrice(e.target.value)}
          />
  
          <button className='button button--filled' type='submit'>
            { isBuy ? <span> Buy Order </span> : <span> Sell Order </span>}
          </button>
        </form>
      </div>
    );
  }
  
  export default Order;
