import fetch from 'isomorphic-fetch'
import keyIndex from 'react-key-index'

import { stateToParams, setError, setResults, unsetLoading } from './index'
import { querystringize } from '../utils'

export const changeIssue = (newIssue, issueId) => ({
  type: 'CHANGE_ISSUE',
  newIssue,
  issueId,
})

export const setErrorIssue = errors => ({
  type: 'SET_ERROR_ISSUE',
  errors,
})

export const setIssuesSelectness = (issuesId, isSelected) => ({
  type: 'SET_ISSUES_SELECTNESS',
  issuesId,
  isSelected,
})

export const toggleIssue = issueId => ({
  type: 'TOGGLE_ISSUE',
  issueId,
})

export const toggleExpanded = issueId => ({
  type: 'TOGGLE_EXPANDED',
  issueId,
})

export const toggleCommentsExpanded = issueId => ({
  type: 'TOGGLE_COMMENTS_EXPANDED',
  issueId,
})

export const fetchIssues = () => async (dispatch, getState) => {
  let response
  let ticketsJson = {},
    commentsJson = {}
  const allErrors = []
  const state = getState()
  const params = querystringize(stateToParams(state, 'tickets'))
  try {
    response = await fetch(`/api/tickets?${params}`, {
      method: 'GET',
      credentials: 'same-origin',
    })
  } catch (e) {
    return dispatch(
      setError(
        'Erreur pendant la récupération des données des tickets',
        'repository'
      )
    )
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      ticketsJson = await response.json()
    } catch (e) {
      return dispatch(setError('La réponse ne contient pas de json', 'issues'))
    }
  } else {
    const jsonMessage =
      typeof ticketsJson === 'undefined' ? '' : ticketsJson.message
    return dispatch(
      setError(
        `${response.status}: ${response.statusText} ${jsonMessage}`,
        'repository'
      )
    )
  }
  for (const index in ticketsJson.objects) {
    if (ticketsJson.objects.hasOwnProperty(index)) {
      if (ticketsJson.objects[index].nb_comments > 0) {
        try {
          response = await fetch(
            `/api/repos/${ticketsJson.objects[index].repo_name}/tickets/${
              ticketsJson.objects[index].ticket_number
            }/comments`,
            {
              method: 'GET',
              credentials: 'same-origin',
            }
          )
        } catch (e) {
          allErrors.push(
            `Erreur pendant la récupération des commentaires du ticket ${
              ticketsJson.objects[index].ticket_number
            }`
          )
        }
        if (response.status < 200 || response.status >= 300) {
          allErrors.push(
            `Erreur [${response.status}] ${
              response.statusText
            } pour les commentaires du ticket ${
              ticketsJson.objects[index].ticket_number
            }`
          )
          ticketsJson.objects[index].comments = []
          continue
        }
        try {
          commentsJson = await response.json()
        } catch (e) {
          allErrors.push(
            'Erreur pendant la récupération des commentaires du' +
              ` ticket ${ticketsJson.objects[index].ticket_number}`
          )
        }
        ticketsJson.objects[index].comments = commentsJson.objects
      } else {
        ticketsJson.objects[index].comments = []
      }
    }
  }
  dispatch(setResults({ ['issues']: ticketsJson.objects }, 'issues'))
  if (allErrors.length > 0) {
    dispatch(setErrorIssue(keyIndex(allErrors, 1)))
  }
}

export const updateATicket = (ticket, values) => async dispatch => {
  let response, json
  const { comments } = ticket
  comments.comments = ticket.comments
  try {
    response = await fetch(
      `/api/repos/${ticket.repo_name}/tickets/${ticket.ticket_number}`,
      {
        method: 'PUT',
        body: JSON.stringify(values),
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (e) {
    return dispatch(
      setError('Erreur pendant la mise à jour du ticket', 'issues')
    )
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      json = await response.json()
    } catch (e) {
      return dispatch(setError('La réponse ne contient pas de json', 'issues'))
    }
    json.objects.comments = comments
    return dispatch(changeIssue(json.objects, ticket.ticket_id))
  }
  const jsonMessage = typeof json === 'undefined' ? '' : json.message
  return dispatch(
    setError(
      `${response.status}: ${response.statusText} ${jsonMessage}`,
      'issues'
    )
  )
}

const findPriorityIndex = (issue, state) => {
  const { priority } = state.labels.results
  priority.priority = state.labels.results.priority
  for (let i = 0; i < priority.length; i++) {
    const currentLabel = issue.labels.filter(
      label => label.label_name === priority[i].text
    )
    if (currentLabel.length > 0) {
      return i
    }
  }
  return null
}

export const updateIssues = actionType => (dispatch, getState) => {
  const state = getState()
  for (const index in state.issues.results.issues) {
    if (state.issues.results.issues.hasOwnProperty(index)) {
      const issue = state.issues.results.issues[index]
      if (issue.selected) {
        switch (actionType) {
          case 'removeSelectedIssuesPriority':
            dispatch(removeTopPriority(issue))
            break
          case 'incrementSelectedIssuesPriority':
            dispatch(incrementPriority(issue))
            break
          default:
            dispatch(closeTicket(issue, state))
        }
      }
    }
  }
  return dispatch(unsetLoading('issues'))
}

export const removeTopPriority = issue => (dispatch, getState) => {
  const state = getState()
  return dispatch(
    updateATicket(issue, {
      labels: issue.labels.filter(
        label => label.label_name !== state.labels.results.priority[0].text
      ),
    })
  )
}

export const incrementPriority = issue => (dispatch, getState) => {
  const state = getState()
  const { priority } = state.labels.results
  priority.priority = state.labels.results.priority
  let currentLabelPriorityIndex = findPriorityIndex(issue, state)
  if (currentLabelPriorityIndex === null) {
    currentLabelPriorityIndex = priority.length - 1
  }
  if (currentLabelPriorityIndex > 0) {
    const newLabelList = issue.labels.filter(
      label => label.label_name !== priority[currentLabelPriorityIndex].text
    )
    newLabelList.push({
      label_name: priority[currentLabelPriorityIndex - 1].text,
      color: priority[currentLabelPriorityIndex - 1].color,
    })
    return dispatch(updateATicket(issue, { labels: newLabelList }))
  }
}

export const closeTicket = (issue, state) => dispatch => {
  dispatch(
    updateATicket(issue, {
      state: 'closed',
      labels: issue.labels.filter(
        label => label.label_name !== state.labels.results.priority[0].text
      ),
    })
  )
}
