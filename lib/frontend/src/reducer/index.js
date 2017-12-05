import { routerReducer } from 'react-router-redux'
import { combineReducers } from 'redux'
import { httpStatusReducer } from 'redux-http-status'

import initial from './initial'

const search = (state = initial.search, action) => {
  switch (action.type) {
    case 'SEARCH':
      return action.search
    default:
      return state
  }
}

const handleResultsLoadingAndError = (state, type, action) => {
  if (action.target !== type) {
    return state
  }
  switch (action.type) {
    case 'SET_RESULTS':
      return {
        ...state,
        results: action.results,
        loading: false,
        mustLoad: false,
        error: null,
      }
    case 'SET_LOADING':
      return {
        ...state,
        loading: true,
        mustLoad: false,
        error: null,
      }
    case 'SET_ERROR':
      return {
        ...state,
        results: { ...initial[type].results },
        loading: false,
        mustLoad: false,
        error: action.error,
      }
  }
  return state
}

const issues = (state = initial.issues, action) => {
  switch (action.type) {
    case 'TOGGLE_ISSUE':
      return {
        ...state,
        results: {
          issues: state.results.issues.map(issue => {
            if (issue.id === action.issueId) {
              return { ...issue, selected: !issue.selected }
            }
            return issue
          }),
        },
      }
    case 'SET_ISSUES_SELECTNESS':
      return {
        ...state,
        results: {
          issues: state.results.issues.map(issue => {
            if (action.issuesId.indexOf(issue.id) > -1) {
              return { ...issue, selected: action.isSelected }
            }
            return issue
          }),
        },
      }
    case 'TOGGLE_EXPANDED':
      return {
        ...state,
        results: {
          issues: state.results.issues.map(issue => {
            if (issue.id === action.issueId) {
              return { ...issue, expanded: !issue.expanded }
            }
            return issue
          }),
        },
      }
    default:
      return handleResultsLoadingAndError(state, 'issues', action)
  }
}

const labels = (state = initial.labels, action) =>
  handleResultsLoadingAndError(state, 'labels', action)

const users = (state = initial.users, action) =>
  handleResultsLoadingAndError(state, 'users', action)

const timeline = (state = initial.timeline, action) =>
  handleResultsLoadingAndError(state, 'timeline', action)

const report = (state = initial.report, action) =>
  handleResultsLoadingAndError(state, 'report', action)

const repositories = (state = initial.repositories, action) =>
  handleResultsLoadingAndError(state, 'repositories', action)

const repository = (state = initial.repository, action) => {
  switch (action.type) {
    case 'DELETE_LABELS':
      return {
        ...state,
        results: {
          ...state.results,
          labels: state.results.labels.filter(
            label => action.deleted.indexOf(label.name) === -1
          ),
          overlyLabels: state.results.overlyLabels.filter(
            label => action.deleted.indexOf(label[0]) === -1
          ),
        },
      }
    case 'CREATE_LABELS':
      return {
        ...state,
        results: {
          ...state.results,
          missingLabels: state.results.missingLabels.filter(label =>
            action.created.find(
              createdLabel => label.name === createdLabel.name
            )
          ),
          labels: state.results.labels.concat(action.created),
        },
      }
    case 'CHANGE_REPOSITORY':
      return {
        results: {
          ...state.results,
          repository: action.newRepository,
          labels: action.newLabels,
        },
      }
    default:
      return handleResultsLoadingAndError(state, 'repository', action)
  }
}

const user = (state = initial.user, action) => {
  switch (action.type) {
    case 'SET_USER':
      return action.user
    default:
      return state
  }
}

const modifiers = (state = initial.modifiers, action) => {
  switch (action.type) {
    case 'SET_MODIFIER':
      return {
        ...state,
        [action.modifier]: action.state,
      }
    default:
      return state
  }
}

export default combineReducers({
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
  router: routerReducer,
  status: httpStatusReducer,
})
