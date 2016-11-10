import { combineReducers } from 'redux'


const reduceIssuesState = (state='open', action) => {
  switch (action.type) {
    case 'SET_ISSUES_STATE':
      return action.issuesState
    default:
      return state
  }
}

const reducer = combineReducers({
    issuesState: reduceIssuesState
})

export default reducer
