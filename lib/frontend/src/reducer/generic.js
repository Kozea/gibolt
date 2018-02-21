import initial from './initial'

export const handleResultsLoadingAndError = (state, type, action) => {
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
    case 'UNSET_LOADING':
      return {
        ...state,
        loading: false,
        mustLoad: false,
        error: null,
      }
    case 'SET_ERROR':
      switch (action.target) {
        case 'circleMilestones':
        case 'items':
          return {
            ...state,
            results: initial[type].results,
            loading: false,
            mustLoad: false,
            error: action.error,
          }
        case 'issueForm':
          return {
            ...state,
            results: {
              ...state.results,
              error: action.error,
            },
          }
        default:
          return {
            ...state,
            results: { ...initial[type].results },
            loading: false,
            mustLoad: false,
            error: action.error,
          }
      }
  }
  return state
}

export const modal = (state = initial.modal, action) => {
  switch (action.type) {
    case 'SET_MODAL':
      return {
        ...state,
        display: action.display,
        creation: action.creation,
        issueId: action.issueId,
      }
    default:
      return state
  }
}

export const modifiers = (state = initial.modifiers, action) => {
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

export const params = (state = initial.params, action) => {
  switch (action.type) {
    case 'SET_PARAMS':
      return action.params
    case 'UPDATE_ISSUE_PARAMS':
      return {
        ...state,
        group: action.params.group,
        grouper: action.params.grouper,
      }
    default:
      return state
  }
}

export const search = (state = initial.search, action) => {
  switch (action.type) {
    case 'SEARCH':
      return action.search
    default:
      return state
  }
}
