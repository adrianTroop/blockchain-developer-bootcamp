// We going to create a tailor made selector 
//to take all the orders and other big chunks of data
//loaddash let us get special function from JS 

import { createSelector } from 'reselect'
import { get, groupBy, reject, maxBy, minBy } from 'lodash';
import moment from 'moment';
import { ethers } from 'ethers';

const GREEN = '#25CE8F'
const RED = '#F45353'

//Special function we get from lodash
const account = state => get(state, 'provider.account')
const tokens = state => get(state, 'tokens.contracts')
const events = state => get(state, 'exchange.events')



const allOrders = state => get(state, 'exchange.allOrders.data', [])
const cancelledOrders = state => get(state, 'exchange.cancelledOrders.data', [])
const filledOrders = state => get(state, 'exchange.filledOrders.data', [])

const openOrders = state => {
    const all = allOrders(state)
    const filled = filledOrders(state)
    const cancelled = cancelledOrders(state)

    const openOrders = reject(all, (order) => {
        const orderFilled = filled.some((o) => o.id.toString() === order.id.toString())
        const orderCancelled = cancelled.some((o) => o.id.toString() === order.id.toString())
        return(orderFilled || orderCancelled)
      })
    return openOrders
}
///////////////// MY EVENTS ////////////////////

export const myEventsSelector = createSelector(
    account,
    events,
    (account, events) =>{
        console.log(events)
    events = events.filter((e) => e.args.user === account)
    console.log(events)
    return events
})

/////////////// MY OPEN ORDERS ////////////////

export const myOpenOrdersSelector = createSelector(
    account,
    tokens,
    openOrders,
    (account,tokens,orders) => {
        //Inside Funct
        if (!tokens[0] || !tokens[1]) { return }

        orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)
        orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)

        orders = decorateMyOpenOrders(orders, tokens)

        orders = orders.sort((a,b) => b.timestamp - a.timestamp)
        return orders
    }
)

const decorateMyOpenOrders = (orders, tokens) => {
    return(
        orders.map((order) => {
            order = decorateOrder(order, tokens)
            order = decorateMyOpenOrder(order, tokens)
            return(order)
        })
    )
}

const decorateMyOpenOrder = (order, tokens) => {
    let orderType = order.tokenGive === tokens[1].address ? 'buy' : 'sell'

    return({
        ...order,
        orderType,
        orderTypeClass: (orderType === 'buy' ? GREEN : RED)
    })
}


const decorateOrder = (order, tokens) => {
    let token0Amount, token1Amount

    if (order.tokenGive === tokens[1].address){
        token0Amount = order.amountGive //the amount of Dapp we are giving
        token1Amount = order.amountGet // the amount of mEth we want
    } else {
        token0Amount = order.amountGet // the amount of Dapp we want
        token1Amount = order.amountGive // the amount of mEth we are giving
    }

    const precision = 100000
    let tokenPrice = (token1Amount/token0Amount)
    tokenPrice = Math.round(tokenPrice * precision) / precision
    

    return({
        ...order,
        token0Amount: ethers.utils.formatUnits(token0Amount,"ether"),
        token1Amount: ethers.utils.formatUnits(token1Amount,"ether"),
        tokenPrice,
        formattedTimestamp: moment.unix(order.timestamp).format('h:mm:ssa d MMM D')
    })
}

////////////////////   ALL FILLED ORDERS ///////////////

export const filledOrdersSelector = createSelector(
    filledOrders,
    tokens,
    (orders, tokens) => {
        if (!tokens[0] || !tokens[1]) { return }
        orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)
        orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)
        
        orders = orders.sort((a,b) => a.timestamp - b.timestamp)

        orders = decorateFilledOrders(orders, tokens)
        
        orders = orders.sort((a, b) => b.timestamp - a.timestamp)

        return orders
    }
)

const decorateFilledOrders = (orders , tokens) => {
    let previousOrder = orders[0]

    return(
        orders.map((order) => {
            order = decorateOrder(order,tokens)
            order = decorateFilledOrder(order,previousOrder)
            previousOrder = order
            return order
        })
    )
}

const decorateFilledOrder = (order, previousOrder) => {
    //Check order and assign color.
    return({
        ...order,
        tokenPriceClass: tokenPriceClass(order.tokenPrice, order.id, previousOrder)
    })
}

const tokenPriceClass = (tokenPrice, orderId, previousOrder) => {
    if(previousOrder.id === orderId)
    {
        return GREEN
    }
    
    //show green price if order price higher than previous order
    //show red price if order price lower than previous order.
    if(previousOrder.tokenPrice <= tokenPrice)
    {
        return GREEN
    } else {
        return RED
    }
}

//////////// MY FILLED ORDERS  /////////////////////

export const myFilledOrdersSelector = createSelector(
    account,
    tokens,
    filledOrders,
    (account, tokens, orders) => {
      if (!tokens[0] || !tokens[1]) { return }

      // Find our orders
      orders = orders.filter((o) => o.user === account || o.creator === account)
      // Filter orders for current trading pair
      orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)
      orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)

      // Sort by date descending
      orders = orders.sort((a, b) => b.timestamp - a.timestamp)

      // Decorate orders - add display attributes
      orders = decorateMyFilledOrders(orders, account, tokens)

      return orders
  }
)

const decorateMyFilledOrders = (orders, account, tokens) => {
  return(
    orders.map((order) => {
      order = decorateOrder(order, tokens)
      order = decorateMyFilledOrder(order, account, tokens)
      return(order)
    })
  )
}

const decorateMyFilledOrder = (order, account, tokens) => {
  const myOrder = order.creator === account

  let orderType
  if(myOrder) {
    orderType = order.tokenGive === tokens[1].address ? 'buy' : 'sell'
  } else {
    orderType = order.tokenGive === tokens[1].address ? 'sell' : 'buy'
  }

  return({
    ...order,
    orderType,
    orderClass: (orderType === 'buy' ? GREEN : RED),
    orderSign: (orderType === 'buy' ? '+' : '-')
  })
}

export const orderBookSelector = createSelector(
    openOrders, 
    tokens,
    (orders, tokens) => {
    //callback do stuff
        if (!tokens[0] || !tokens[1]) { return }

        // Filter orders by selected tokens
        orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)
        orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)

        //Decorate orders
        orders = decorateOrderBookOrders(orders, tokens)

        //Grouping orders with loads GroupBy library
        orders = groupBy(orders, 'orderType')
        //We need to sort them by price so the recents show up on top
        //JS Sort method
        // Sort order by token price
        const buyOrders = get(orders, 'buy', [])

        //Sorting buy orders to have the highest price on top
        orders = {
            ...orders,
            buyOrders: buyOrders.sort((a,b) => b.tokenPrice - a.tokenPrice)
        }

        const sellOrders = get(orders, 'sell', [])

        orders = {
            ...orders,
            sellOrders: sellOrders.sort((a,b) => b.tokenPrice - a.tokenPrice)
        }
    return orders
})

const decorateOrderBookOrders = (orders, tokens) => {
    return(
        orders.map((order) => {
            order = decorateOrder(order,tokens)
            order = decorateOrderBookOrder(order, tokens)
            return(order)
        })
    )
}

const decorateOrderBookOrder = (order, tokens) => {
    const orderType = order.tokenGive === tokens[1].address ? 'buy' : 'sell'

    return({
        ...order,
        orderType,
        orderTypeClass : (orderType === 'buy' ? GREEN : RED ),
        orderFillAction : (orderType === 'buy' ? 'sell' : 'buy')
    })
}

////// PRICE CHART SELECTOR

export const priceChartSelector = createSelector(
    filledOrders,
    tokens,
    (orders, tokens) => {
      if (!tokens[0] || !tokens[1]) { return }
  
      // Filter orders by selected tokens
      orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)
      orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)
  
      // Sort orders by date ascending to compare history
      orders = orders.sort((a, b) => a.timestamp - b.timestamp)
  
      // Decorate orders - add display attributes
      orders = orders.map((o) => decorateOrder(o, tokens))
  
      // Get last 2 order for final price & price change
      let secondLastOrder, lastOrder
      [secondLastOrder, lastOrder] = orders.slice(orders.length - 2, orders.length)
  
      // get last order price
      const lastPrice = get(lastOrder, 'tokenPrice', 0)
  
      // get second last order price
      const secondLastPrice = get(secondLastOrder, 'tokenPrice', 0)
  
      return ({
        lastPrice,
        lastPriceChange: (lastPrice >= secondLastPrice ? '+' : '-'),
        series: [{
          data: buildGraphData(orders)
        }]
      })
  
    }
  )
  
  const buildGraphData = (orders) => {
    // Group the orders by hour for the graph
    orders = groupBy(orders, (o) => moment.unix(o.timestamp).startOf('hour').format())
  
    // Get each hour where data exists
    const hours = Object.keys(orders)
  
    // Build the graph series
    const graphData = hours.map((hour) => {
      // Fetch all orders from current hour
      const group = orders[hour]
  
      // Calculate price values: open, high, low, close
      const open = group[0] // first order
      const high = maxBy(group, 'tokenPrice') // high price
      const low = minBy(group, 'tokenPrice') // low price
      const close = group[group.length - 1] // last order
  
      return({
        x: new Date(hour),
        y: [open.tokenPrice, high.tokenPrice, low.tokenPrice, close.tokenPrice]
      })
    })
  
    return graphData
  }