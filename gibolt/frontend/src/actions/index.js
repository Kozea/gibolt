import fetch from 'isomorphic-fetch'


export const selectPriorityLabel = (label) => {
  return {
    type: 'SELECT_PRIORITY_LABEL',
    label
  }
}

export const selectOnlyPriorityLabel = (label) => {
  return {
    type: 'SELECT_ONLY_PRIORITY_LABEL',
    label
  }
}

export const setIssuesState = (issuesState) => {
  return {
    type: 'SET_ISSUES_STATE',
    issuesState
  }
}

export const setGrouper = (grouper) => {
  return {
    type: 'SET_GROUPER',
    grouper
  }
}

export const search = (search) => {
  return {
    type: 'SEARCH',
    search
  }
}

export const setPreset = (preset) => {
  return {
    type: 'SET_PRESET',
    preset
  }
}

export const setIssues = (issues) => {
  return {
    type: 'SET_ISSUES',
    issues
  }
}

// Thunks
export const fetchIssues = () => {
  return (dispatch) => {
    fetch('/issues.json')
    .then(response => response.json())
    .then(json =>
      dispatch(setIssues(json.issues)))
  }
}
