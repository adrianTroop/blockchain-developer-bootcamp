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
        default:
            return state     
    }
}
