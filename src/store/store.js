//Imports from Redux
import { createStore, combineReducers, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";

/* Import Reducers */
//everytime you create a reducer you need to add it to the combine reducers
import {provider,tokens, exchange} from './reducers'

const reducer = combineReducers({
    provider,
    tokens,
    exchange
})

const initialState = {}

const middleware = [thunk]

const store = createStore(reducer, initialState, composeWithDevTools(applyMiddleware(...middleware)))

export default store
