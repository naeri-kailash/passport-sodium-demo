import {combineReducers} from 'redux'

import auth from './auth'
import quotes from './quotes'

// We combine the reducers here so that they
// can be left split apart above
const quotesApp = combineReducers({
  auth,
  quotes
})

export default quotesApp