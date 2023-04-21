//Reducers
//This 'export' allows to use this info in other files.
export const provider = (state = {} , action) =>{
    switch(action.type){
        case 'PROVIDER_LOADED':
            return{
                //check current state but dont modify it just update it
                ...state,
                connection: action.connection
            }
        case 'NETWORK_LOADED':
            return {
                ...state,
                chainId: action.chainId
            }
        case 'ACCOUNT_LOADED':
            return {
                ...state,
                account: action.account
            }
        case 'ETHER_BALANCE_LOADED':
            return {
                ...state,
                balance: action.balance
            }
        default:
            return state     
    }
}

const DEFAULT_TOKENS_STATE = {
    loaded: false,
    contracts:[],
    symbols: [] 
}

export const tokens = (state = DEFAULT_TOKENS_STATE , action) =>{
    switch(action.type){
        case 'TOKEN_1_LOADED':
            return{
                //check current state but dont modify it just update it
                ...state,
                loaded:true,
                // we update the current token loaded so i doesnt add unlimited tokens #BUGFIXED ON VIDEO
                contracts: [action.token],
                symbols: [action.symbol]
            }
        case 'TOKEN_1_BALANCE_LOADED':
            return{
                ...state,
                //Override current balance
                balances: [action.balance]
            }
        case 'TOKEN_2_LOADED':
            return{
                //check current state but dont modify it just update it                    ...state,
                loaded:true,
                //appends to the current state
                contracts: [...state.contracts, action.token],
                symbols: [...state.symbols,action.symbol]
            }
        case 'TOKEN_2_BALANCE_LOADED':
            return{
                ...state,
                //Override current balance
                balances: [...state.balances, action.balance]
            }
        default:
            return state     
    }
}

export const exchange = (state = {loaded: false, contract: {}} , action) =>{
    switch(action.type){
        case 'EXCHANGE_LOADED':
            return{
                //check current state but dont modify it just update it
                ...state,
                loaded:true,
                contract: action.exchange
            }

        //BALANCES
        case 'EXCHANGE_TOKEN_1_BALANCE_LOADED':
            return{
                //check current state but dont modify it just update it
                ...state,
                balances: [action.balance]
            }
        case 'EXCHANGE_TOKEN_2_BALANCE_LOADED':
            return{
                //check current state but dont modify it just update it
                ...state,
                balances: [...state.balances, action.balance]
            }
        default:
            return state
    }
}
