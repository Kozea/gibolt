import fetch from 'isomorphic-fetch'


export const search = (search) => {
  return {
    type: 'SEARCH',
    search
  }
}

export const setLoading = () => {
  return {
    type: 'SET_LOADING'
  }
}

export const setIssues = (issues) => {
  return {
    type: 'SET_ISSUES',
    issues
  }
}

export const setIssuesError = (error) => {
  return {
    type: 'SET_ISSUES_ERROR',
    error
  }
}

const stateToParams = (state) => {
  return {
    labels: state.labels.selected,
    search: state.search
  }
}

const maybeSetIssues = (json) => {
  return (dispatch, getState) => {
    let state = getState()
    if (JSON.stringify(json.params) == JSON.stringify(stateToParams(state))) {
      dispatch(setIssues(json.issues))
    } else {
      console.log('State is not coherent with fetch response', json.params, state)
    }
  }
}

export const fetchIssues = () => {
  return (dispatch, getState) => {
    let state = getState()
    fetch('/issues.json', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(stateToParams(state))
    })
    .then(response => {
        if (response.status >= 200 && response.status < 300) {
          return response
        }
        throw new Error(`[${ response.status }] ${ response.statusText }`)
    })
    .then(response => response.json())
    .then(json => dispatch(maybeSetIssues(json)))
    .catch(error => dispatch(setIssuesError(error.toString())))
  }
}

export const toggleIssue = (issueId) => {
  return {
    type: 'TOGGLE_ISSUE',
    issueId
  }
}

export const setIssuesSelectness = (issuesId, isSelected) => {
  return {
    type: 'SET_ISSUES_SELECTNESS',
    issuesId,
    isSelected
  }
}

export const toggleExpanded = (issueId) => {
  return {
    type: 'TOGGLE_EXPANDED',
    issueId
  }
}
