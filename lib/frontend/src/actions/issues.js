import fetch from 'isomorphic-fetch'

import { stateToParams, setError, setResults, unsetLoading } from './index'
import { querystringize } from '../utils'

export const updateIssueParams = params => ({
  type: 'UPDATE_ISSUE_PARAMS',
  params,
})

export const changeIssue = (newIssue, issueId) => ({
  type: 'CHANGE_ISSUE',
  newIssue,
  issueId,
})

export const updateCurrentIssue = newIssue => ({
  type: 'UPDATE_CURRENT_ISSUE',
  newIssue,
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

export const setModal = (display, creation, issueId) => ({
  type: 'SET_MODAL',
  display,
  creation,
  issueId,
})

export const toggleIssue = issueId => ({
  type: 'TOGGLE_ISSUE',
  issueId,
})

export const toggleExpanded = issueId => ({
  type: 'TOGGLE_EXPANDED',
  issueId,
})

export const toggleCommentsExpanded = (issueId, comments) => ({
  type: 'TOGGLE_COMMENTS_EXPANDED',
  issueId,
  comments,
})

export const fetchIssues = () => async (dispatch, getState) => {
  let response
  let ticketsJson = {}
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
      dispatch(
        setResults(
          {
            ['issues']: ticketsJson.objects,
            ['agenda']: [],
            ['currentIssue']: {},
          },
          'issues'
        )
      )
    } catch (e) {
      return dispatch(setError('La réponse ne contient pas de json', 'issues'))
    }
  } else {
    const jsonMessage =
      typeof ticketsJson === 'undefined' ? '' : ticketsJson.message
    return dispatch(
      setError(
        `${response.status}: ${response.statusText} ${jsonMessage}`,
        'issues'
      )
    )
  }
}

export const getAndToggleCommentsExpanded = issue => async dispatch => {
  if (issue.comments.length === 0) {
    let response
    let commentsJson = {}
    try {
      response = await fetch(
        `/api/repos/${issue.repo_name}/tickets/${issue.ticket_number}/comments`,
        {
          method: 'GET',
          credentials: 'same-origin',
        }
      )
    } catch (e) {
      return dispatch(
        setError('Erreur pendant la récupération des commentaires', 'issues')
      )
    }
    if (response.status >= 200 && response.status < 300) {
      try {
        commentsJson = await response.json()
        dispatch(toggleCommentsExpanded(issue.ticket_id, commentsJson.objects))
      } catch (e) {
        return dispatch(
          setError('La réponse ne contient pas de json', 'issues')
        )
      }
    } else {
      const jsonMessage =
        typeof commentsJson === 'undefined' ? '' : commentsJson.message
      return dispatch(
        setError(
          `${response.status}: ${response.statusText} ${jsonMessage}`,
          'repository'
        )
      )
    }
  } else {
    dispatch(toggleCommentsExpanded(issue.ticket_id, issue.comments))
  }
}

export const updateATicket = (ticket, values) => async (dispatch, getState) => {
  let response, json
  const state = getState()
  const users = state.users.results
  const { comments } = ticket
  comments.comments = ticket.comments
  comments.comments_expanded = ticket.comments_expanded
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
    const user = users.filter(usr => usr.user_id === json.objects.user.user_id)
    if (user[0].user_name) {
      json.objects.user = {
        user_id: user[0].user_id,
        user_name: user[0].user_name,
        avatar_url: user[0].avatar_url,
      }
    }
    json.objects.comments = comments.comments
    json.objects.comments_expanded = comments.comments_expanded
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

export const updateLabelsList = (label, labels, selectedLabels) => {
  const selectedLabel = labels.filter(lab => lab.value === label).map(lab => ({
    label_name: lab.label,
    label_color: lab.color,
  }))
  if (selectedLabel[0]) {
    selectedLabels.push(selectedLabel[0])
  }
  return selectedLabels
}

export const getOptionsLabels = (issue, labels) => {
  const options = []
  const issuesLabels = []
  let circleLabelId = ''
  Object.keys(labels).map(key =>
    labels[key].map(label => {
      options.push({
        color: label.color,
        label: label.text,
        type: key,
        value: label.label_id,
        disabled: false,
      })
      if (issue.labels.find(x => x.label_name === label.text)) {
        issuesLabels.push({
          color: label.color,
          label: label.text,
          type: key,
          value: label.label_id,
        })
        if (key === 'circle') {
          circleLabelId = label.label_id
        }
      }
    })
  )
  return { circleLabelId, issuesLabels, options }
}

export const addOrUpdateComment = (
  ticket,
  values,
  commentId = null
) => async dispatch => {
  let response, json, url, method
  let comment = {}
  if (commentId) {
    url = `/api/repos/${ticket.repo_name}/tickets/comments/${commentId}`
    method = 'PUT'
  } else {
    url = `/api/repos/${ticket.repo_name}/tickets/${
      ticket.ticket_number
    }/comments`
    method = 'POST'
  }
  try {
    response = await fetch(url, {
      method,
      body: JSON.stringify(values),
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
    })
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
    comment = json.objects
    comment.ticket_number = ticket.ticket_number
    if (commentId) {
      ticket.comments.map((com, index) => {
        if (com.comment_id === comment.comment_id) {
          ticket.comments[index] = comment
        }
      })
    } else {
      ticket.nb_comments += 1
      ticket.comments.push(comment)
    }
    return dispatch(changeIssue(ticket, ticket.ticket_id))
  }
  const jsonMessage = typeof json === 'undefined' ? '' : json.message
  return dispatch(
    setError(
      `${response.status}: ${response.statusText} ${jsonMessage}`,
      'issues'
    )
  )
}
