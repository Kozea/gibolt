import fetch from 'isomorphic-fetch'
import equal from 'deep-equal'
import { PUSH } from 'redux-little-router'
import { allLabelsFromState, usersFromState, timelineRangeFromState,
  reportRangeFromState, repositoryNameFromState } from '../utils'


export const search = (search) => {
  return {
    type: 'SEARCH',
    search
  }
}

export const setLoading = (target) => {
  return {
    type: 'SET_LOADING',
    target
  }
}

export const setResults = (results, target) => {
  return {
    type: 'SET_RESULTS',
    results,
    target
  }
}

export const setError = (error, target) => {
  return {
    type: 'SET_ERROR',
    error,
    target
  }
}

export const setModifier = (modifier, state) => {
  return {
    type: 'SET_MODIFIER',
    modifier,
    state
  }
}

const stateToParams = (state, target) => {
  switch (target) {
    case 'issues':
      let users = usersFromState(state)
      return {
        labels: allLabelsFromState(state).filter(x => x != ''),
        search: state.search,
        assignee: users.assignee[0] || '',
        involves: users.involves[0] || '',
      }
    case 'timeline':
      return timelineRangeFromState(state)
    case 'report':
      return reportRangeFromState(state)
    case 'repositories':
      return {}
    case 'repository':
      return repositoryNameFromState(state)
  }
}

const maybeSetResults = (json, target) => {
  return (dispatch, getState) => {
    let state = getState()
    if (equal(json.params, stateToParams(state, target))) {
      dispatch(setResults(json.results, target))
    } else {
      console.log('State is not coherent with fetch response',
        json.params, stateToParams(state, target))
    }
  }
}

export const fetchResults = (target) => {
  return (dispatch, getState) => {
    let state = getState()
    fetch(`/${ target }.json`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(stateToParams(state, target))
    })
    .then(response => {
        if (response.status >= 200 && response.status < 300) {
          return response
        }
        throw new Error(`[${ response.status }] ${ response.statusText }`)
    })
    .then(response => response.json())
    .then(json => dispatch(maybeSetResults(json, target)))
    .catch(error => dispatch(setError(error.toString(), target)))
  }
}

export const postChangeSelectedIssuesPriority = (change) => {
  return (dispatch, getState) => {
    let state = getState()
    fetch('/apply_labels', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        issues: state.issues.results.issues.filter((issue) => issue.selected).map((issue) => {
          return {url: issue.url, labels: issue.labels}
        }),
        action: change
      })
    })
    .then(response => {
        if (response.status >= 200 && response.status < 300) {
          return response
        }
        throw new Error(`[${ response.status }] ${ response.statusText }`)
    })
    .then(response => response.json())
    .then(() => dispatch(fetchResults('issues')))
  }
}

export const createRepositoryLabels = (createdLabels) => {
  return {
    type: 'CREATE_LABELS',
    created: createdLabels,
  }
}

export const createLabels = () => {
  return (dispatch, getState) => {
    let state = getState()
    fetch('/repository/create_labels', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        labels: state.repository.results.missingLabels,
        name: repositoryNameFromState(state)['name'],
      })
    })
    .then(response => {
      if (response.status >= 200 && response.status < 300) {
        return response
      }
      throw new Error(`[${ response.status }] ${ response.statusText }`)
    })
    .then(response => response.json())
    .then(json => dispatch(createRepositoryLabels(json.created)))
  }
}

export const deleteRepositoryLabels = (deletedLabels) => {
  return {
    type: 'DELETE_LABELS',
    deleted: deletedLabels,
  }
}

export const deleteLabels = () => {
  return (dispatch, getState) => {
    let state = getState()
    fetch('/repository/delete_labels', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        labels: state.repository.results.overlyLabels,
        name: repositoryNameFromState(state)['name'],
      })
    })
    .then(response => {
      if (response.status >= 200 && response.status < 300) {
        return response
      }
      throw new Error(`[${ response.status }] ${ response.statusText }`)
    })
    .then(response => response.json())
    .then(json => dispatch(deleteRepositoryLabels(json.deleted)))
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

export const push = (payload) => {
  return {
    type: PUSH,
    payload: payload
  }
}
