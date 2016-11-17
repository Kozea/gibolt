import fetch from 'isomorphic-fetch'
import equal from 'deep-equal'
import { PUSH } from 'redux-little-router'
import { allLabelsFromState, usersFromState, timelineRangeFromState } from '../utils'


export const search = (search) => {
  return {
    type: 'SEARCH',
    search
  }
}

export const setIssuesLoading = () => {
  return {
    type: 'SET_ISSUES_LOADING'
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

export const setTimelineLoading = () => {
  return {
    type: 'SET_TIMELINE_LOADING'
  }
}

export const setTimeline = (timeline) => {
  return {
    type: 'SET_TIMELINE',
    timeline
  }
}

export const setTimelineError = (error) => {
  return {
    type: 'SET_TIMELINE_ERROR',
    error
  }
}

const stateToParams = (state) => {
  let users = usersFromState(state)
  return {
    labels: allLabelsFromState(state).filter(x => x != ''),
    search: state.search,
    assignee: users.assignee[0] || '',
    involves: users.involves[0] || '',
  }
}

const maybeSetIssues = (json) => {
  return (dispatch, getState) => {
    let state = getState()
    if (equal(json.params, stateToParams(state))) {
      dispatch(setIssues(json.issues))
    } else {
      console.log('State is not coherent with fetch response',
        json.params, stateToParams(state))
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
        issues: state.issues.list.filter((issue) => issue.selected).map((issue) => {
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
    .then(() => dispatch(fetchIssues()))
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

const maybeSetTimeline = (json) => {
  return (dispatch, getState) => {
    let state = getState()
    if (equal(json.params, timelineRangeFromState(state))) {
      dispatch(setTimeline(json.timeline))
    } else {
      console.log('State is not coherent with fetch response',
        json.params, timelineRangeFromState(state))
    }
  }
}

export const fetchTimeline = () => {
  return (dispatch, getState) => {
    let state = getState()
    fetch('/timeline.json', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(timelineRangeFromState(state))
    })
    .then(response => {
        if (response.status >= 200 && response.status < 300) {
          return response
        }
        throw new Error(`[${ response.status }] ${ response.statusText }`)
    })
    .then(response => response.json())
    .then(json => dispatch(maybeSetTimeline(json)))
    .catch(error => dispatch(setTimelineError(error.toString())))
  }
}

export const push = (payload) => {
  return {
    type: PUSH,
    payload: payload
  }
}
