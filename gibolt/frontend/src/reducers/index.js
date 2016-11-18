import { combineReducers } from 'redux'

const initialLabels = {
    priority: [{text: 'sprint', color: '#009800'}],
    qualifier: []
}

const labels = (state=initialLabels, action) => state

const search = (state='', action) => {
  switch (action.type) {
    case 'SEARCH':
      return action.search
    default:
      return state
  }
}


const handleResultsLoadingAndError = (state, type, action) => {
  if (action.target != type) {
    return state
  }
  switch (action.type) {
    case 'SET_RESULTS':
      return {
        ...state,
        results: action.results,
        loading: false,
        mustLoad: false,
        error: null
      }
    case 'SET_LOADING':
      return {
        ...state,
        loading: true,
        mustLoad: false,
        error: null
      }
    case 'SET_ERROR':
      return {
        ...state,
        results: action.results,
        loading: false,
        mustLoad: false,
        error: action.error
      }
    }
    return state
}

const emptyResults = {
  results: {},
  loading: false,
  mustLoad: true,
  error: null
}

const emptyIssues = {
  ...emptyResults,
  results: {
    issues: []
  }
}
const issues = (state={...emptyResults}, action) => {
  switch (action.type) {
    case 'TOGGLE_ISSUE':
      return {
        ...state,
        results: {
          issues: state.results.issues.map(issue => {
            if (issue.id == action.issueId) {
              return {...issue, selected: !issue.selected}
            }
            return issue
          })
        }
      }
    case 'SET_ISSUES_SELECTNESS':
      return {
        ...state,
        results: {
          issues: state.results.issues.map(issue => {
            if (action.issuesId.indexOf(issue.id) > -1) {
              return {...issue, selected: action.isSelected}
            }
            return issue
          })
        }
      }
    case 'TOGGLE_EXPANDED':
      return {
        ...state,
        results: {
          issues: state.results.issues.map(issue => {
            if (issue.id == action.issueId) {
              return {...issue, expanded: !issue.expanded}
            }
            return issue
          })
        }
      }
    default:
      return handleResultsLoadingAndError(state, 'issues', action)
  }
}

const emptyTimeline = {
  ...emptyResults,
  results: {
    milestones: []
  }
}
const timeline = (state={...emptyResults}, action) => {
  return handleResultsLoadingAndError(state, 'timeline', action)
}

const emptyReport = {
  ...emptyResults,
  results: {
    issues: []
  }
}
const report = (state={...emptyResults}, action) => {
  return handleResultsLoadingAndError(state, 'report', action)
}

const emptyRepository = {
  ...emptyResults,
  results: {
    repositories: []
  }
}
const repository = (state={...emptyResults}, action) => {
  return handleResultsLoadingAndError(state, 'repository', action)
}

const users = (state=[], action) => state
const user = (state=[], action) => state

const reducer = combineReducers({
  labels,
  search,
  issues,
  timeline,
  report,
  repository,
  users,
  user,
})

export default reducer
