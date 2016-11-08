import { combineReducers } from 'redux'
const initialState = {
  val: 0,
  start: 0,
  step: 1
}

const count = (state=initialState, action) => {
  switch (action.type) {
    case 'INCREMENT_COUNTER':
      return Object.assign({}, state, {
        val: state.val += state.step
      })
    case 'RESET_COUNTER':
      return Object.assign({}, state, {
        val: state.start
      })
    default:
      return state
  }
}

const logs = (state=[], action) => {
  switch (action.type) {
    case 'LOG':
      return [
        action.message,
        ...state
      ]
    case 'DELETE_LOG':
      return state.filter(e => e.id != action.messageId)
    default:
      return state
  }
}

const version = (state='?', action) => {
  switch (action.type) {
    case 'SET_VERSION':
      return action.version
    default:
      return state
  }
}

const reducer = combineReducers({
  count,
  messages: logs,
  version: version
})

export default reducer
