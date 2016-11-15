import { combineReducers } from 'redux'

const initialLabels = {
  available: {
      priority: [{text: 'sprint', color: '#009800'}],
      qualifier: []
  },
  selected: {
      priority: ['sprint'],
      qualifier: []
  }
}

const labels = (state=initialLabels, action) => {
  switch (action.type) {
    case 'SELECT_LABEL':
      return  {
        ...state,
        selected: {
          ...state.selected,
          [action.label_type]: [...state.selected[action.label_type], action.label]
        }
      }
    case 'SELECT_ONLY_LABEL':
      return  {
        ...state,
        selected: {
          ...state.selected,
          [action.label_type]: [action.label]
        }
      }
    default:
      return state
  }
}

const grouper = (state='state', action) => {
  switch (action.type) {
    case 'SET_GROUPER':
      return action.grouper
    default:
      return state
  }
}

const search = (state='', action) => {
  switch (action.type) {
    case 'SEARCH':
      return action.search
    default:
      return state
  }
}

const preset = (state='my_sprint', action) => {
  switch (action.type) {
    case 'SET_PRESET':
      return action.preset
    default:
      return state
  }
}

const emptyIssues = {
  list: [],
  loading: false,
  mustLoad: true,
  error: null
}

const issues = (state=emptyIssues, action) => {
  switch (action.type) {
    case 'SET_ISSUES':
      return {
        ...state,
        list: action.issues,
        loading: false,
        mustLoad: false,
        error: null
      }
    case 'SELECT_LABEL':
    case 'SELECT_ONLY_LABEL':
    case 'SEARCH':
    case 'SET_PRESET':
      return {
        ...state,
        loading: true,
        mustLoad: false,
        error: null
      }
    case 'SET_ISSUES_ERROR':
      return {
        ...state,
        list: [],
        loading: false,
        mustLoad: false,
        error: action.error
      }
    case 'TOGGLE_ISSUE':
      return {
        ...state,
        list: state.list.map(issue => {
          if (issue.id !== action.issueId) {
            return issue
          }
          return {...issue, selected: !issue.selected}
        })
      }
    default:
      return state
  }
}

const user = (state=[], action) => state

const reducer = combineReducers({
  labels,
  grouper,
  search,
  preset,
  issues,
  user,
})

export default reducer
