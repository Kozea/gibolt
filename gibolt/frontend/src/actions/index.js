import fetch from 'isomorphic-fetch'
import equal from 'deep-equal'
import { PUSH } from 'redux-little-router'
import { allLabelsFromState, usersFromState,
         timelineRangeFromState, reportRangeFromState } from '../utils'


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
