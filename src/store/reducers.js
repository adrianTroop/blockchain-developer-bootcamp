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
        default:
            return state     
    }
}

export const tokens = (state = {loaded: false, contract: null } , action) =>{
    switch(action.type){
        case 'TOKEN_LOADED':
            return{
                //check current state but dont modify it just update it
                ...state,
                loaded:true,
                contract: action.token,
                symbol: action.symbol
            }
        default:
            return state     
    }
}
