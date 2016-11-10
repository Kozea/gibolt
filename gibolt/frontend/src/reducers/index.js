import { combineReducers } from 'redux'


const reduceIssuesState = (state='open', action) => {
  switch (action.type) {
    case 'SET_ISSUES_STATE':
      return action.issuesState
    default:
      return state
  }
}

const reduceGrouper = (state='assignee', action) => {
  switch (action.type) {
    case 'SET_GROUPER':
      return action.grouper
    default:
      return state
  }
}


const reducer = combineReducers({
    issuesState: reduceIssuesState,
    grouper: reduceGrouper,
})

export default reducer
