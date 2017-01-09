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

const emptyResults = {
  results: {},
  loading: false,
  mustLoad: true,
  error: null
}

const empty = {
  'issues': {
    ...emptyResults,
    results: {
      issues: []
    }
  },
  'timeline': {
    ...emptyResults,
    results: {
      milestones: []
    }
  },
  'report': {
    ...emptyResults,
    results: {
      issues: []
    }
  },
  'repositories': {
    ...emptyResults,
    results: {
      repositories: []
    }
  },
  'repository': {
    ...emptyResults,
    results: {
      labels: [],
      missingLabels: [],
      overlyLabels: [],
      repository: {permissions: {push: false}}
    }
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
        results: { ...empty[type].results },
        loading: false,
        mustLoad: false,
        error: action.error
      }
    }
    return state
}

const issues = (state=empty.issues, action) => {
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

const timeline = (state=empty.timeline, action) => {
  return handleResultsLoadingAndError(state, 'timeline', action)
}

const report = (state=empty.report, action) => {
  return handleResultsLoadingAndError(state, 'report', action)
}

const repositories = (state=empty.repositories, action) => {
  return handleResultsLoadingAndError(state, 'repositories', action)
}

const repository = (state=empty.repository, action) => {
  switch (action.type) {
    case 'DELETE_LABELS':
      return {
        ...state,
        results: {
          ...state.results,
          labels: state.results.labels.filter(label => action.deleted.indexOf(label.name) == -1),
          overlyLabels: state.results.overlyLabels.filter(label => action.deleted.indexOf(label[0]) == -1),
        }
      }
    case 'CREATE_LABELS':
      return {
        ...state,
        results: {
          ...state.results,
          missingLabels: state.results.missingLabels.filter(label => {
            return action.created.find((createdLabel) => label.name == createdLabel.name)
          }),
          labels : state.results.labels.concat(action.created),
        }
      }
    default:
      return handleResultsLoadingAndError(state, 'repository', action)
  }
}

const users = (state=[], action) => state
const user = (state=[], action) => state

const modifiers = (state={ ctrl: false, shift: false, alt: false }, action) => {
  switch (action.type) {
    case 'SET_MODIFIER':
      return {
        ...state,
        [action.modifier]: action.state
      }
    default:
      return state
  }
}

const reducer = combineReducers({
  labels,
  search,
  issues,
  timeline,
  report,
  repositories,
  repository,
  users,
  user,
  modifiers,
})

export default reducer
