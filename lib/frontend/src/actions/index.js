import equal from 'deep-equal'
import fetch from 'isomorphic-fetch'
import keyIndex from 'react-key-index'

import {
  allLabelsFromState,
  getMissingAndOverlyLabels,
  reportRangeFromState,
  repositoryNameFromState,
  timelineRangeFromState,
  usersFromState,
} from '../utils'

export const search = search => ({
  type: 'SEARCH',
  search,
})

export const setUser = user => ({
  type: 'SET_USER',
  user,
})

export const setLoading = target => ({
  type: 'SET_LOADING',
  target,
})

export const setResults = (results, target) => ({
  type: 'SET_RESULTS',
  results,
  target,
})

export const setError = (error, target) => ({
  type: 'SET_ERROR',
  error,
  target,
})

// specific error until all merge
export const setErrorRepo = errors => ({
  type: 'SET_ERROR_REPO',
  errors,
})

export const setModifier = (modifier, state) => ({
  type: 'SET_MODIFIER',
  modifier,
  state,
})

export const unsetLoading = target => ({
  type: 'UNSET_LOADING',
  target,
})

export const changeIssue = (newIssue, issueId) => ({
  type: 'CHANGE_ISSUE',
  newIssue,
  issueId,
})

export const addRepositoryTicket = newTicket => ({
  type: 'ADD_REPOSITORY_TICKET',
  newTicket,
})

export const changeRepository = (newRepository, newLabels) => ({
  type: 'CHANGE_REPOSITORY',
  newRepository,
  newLabels,
})

export const updateRepoLabels = missingAndOverlyLabels => ({
  type: 'UPDATE_LABELS',
  missingAndOverlyLabels,
})

export const stateToParams = (state, target) => {
  let users
  switch (target) {
    case 'tickets':
      users = usersFromState(state)
      return {
        labels: allLabelsFromState(state).filter(x => x !== ''),
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
    case 'organisation':
      return {}
    case 'repository':
      return repositoryNameFromState(state)
  }
}

export const setMissingAndOverlyLabels = () => (dispatch, getState) => {
  const state = getState()
  const missingAndOverlyLabels = getMissingAndOverlyLabels(state)
  return dispatch(updateRepoLabels(missingAndOverlyLabels))
}

const maybeSetResults = (json, target) => (dispatch, getState) => {
  const state = getState()
  if (equal(json.params, stateToParams(state, target))) {
    dispatch(setResults(json.results, target))
  } else {
    console.error(
      'State is not coherent with fetch response',
      json.params,
      stateToParams(state, target)
    )
  }
}

export const fetchResults = target => async (dispatch, getState) => {
  let response, json
  let isOldRoute = false // should be deleted after all merge
  try {
    const state = getState()
    switch (target) {
      case 'repositories':
        response = await fetch('/api/repos', {
          method: 'GET',
          credentials: 'same-origin',
        })
        break
      case 'organisation':
        response = await fetch('/api/circles', {
          method: 'GET',
          credentials: 'same-origin',
        })
        console.log('response organisation')
        console.log(response)
        break
      // should be the default case, after all merge
      case 'users':
      case 'labels':
        response = await fetch(`/api/${target}`, {
          method: 'GET',
          credentials: 'same-origin',
        })
        break
      case 'report':
        response = await fetch(`/api/${target}`, {
          method: 'POST',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(stateToParams(state, target)),
        })
        break
      default:
        // old routes => should be deleted after all merge
        console.log('default')
        isOldRoute = true
        response = await fetch(`/api/${target}.json`, {
          method: 'POST',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(stateToParams(state, target)),
        })
    }
  } catch (e) {
    console.error(e)
    return dispatch(
      setError('Erreur pendant la récupération des données'),
      target
    )
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      json = await response.json()
      console.log('json')
      console.log(json)
    } catch (e) {
      return dispatch(setError('La réponse ne contient pas de json', target))
    }
    if (isOldRoute || target === 'report') {
      return dispatch(maybeSetResults(json, target))
    }
    return dispatch(setResults(json.objects, target))
  }
  const jsonMessage = typeof json === 'undefined' ? '' : json.message
  return dispatch(
    setError(
      `${response.status}: ${response.statusText} ${jsonMessage}`,
      target
    )
  )
}
export const fetchRepository = () => async (dispatch, getState) => {
  let response, json
  let repositoryJson = {}
  let labelsJson = {}
  const state = getState()
  const repoName = repositoryNameFromState(state)
  try {
    response = await fetch(`/api/repos/${repoName.name}`, {
      method: 'GET',
      credentials: 'same-origin',
    })
  } catch (e) {
    return dispatch(
      setError(
        'Erreur pendant la récupération des données du repository',
        'repository'
      )
    )
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      repositoryJson = await response.json()
    } catch (e) {
      return dispatch(
        setError('La réponse ne contient pas de json', 'repository')
      )
    }
  } else {
    return dispatch(
      setError(
        `${response.status}: ${response.statusText} ${json.message}`,
        'repository'
      )
    )
  }
  try {
    response = await fetch(`/api/repos/${repoName.name}/labels`, {
      method: 'GET',
      credentials: 'same-origin',
    })
  } catch (e) {
    return dispatch(
      setError(
        'Erreur pendant la récupération des données des labels du repository'
      )
    )
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      labelsJson = await response.json()
    } catch (e) {
      return dispatch(
        setError('La réponse ne contient pas de json', 'repository')
      )
    }
    dispatch(changeRepository(repositoryJson.objects, labelsJson.objects))
    return dispatch(setMissingAndOverlyLabels())
  }
}

export const updateATicket = (ticket, values) => async dispatch => {
  let response, json
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
    return dispatch(setError('Erreur pendant la mise à jour du ticket'))
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      json = await response.json()
    } catch (e) {
      return dispatch(setError('La réponse ne contient pas de json'))
    }
    return dispatch(changeIssue(json.objects, ticket.ticket_id))
  }
  return dispatch(
    setError(
      `${response.status}: ${response.statusText} ${json.message}`,
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
            dispatch(closeTicket(issue))
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

export const closeTicket = issue => dispatch =>
  dispatch(updateATicket(issue, { state: 'closed' }))

export const createRepositoryLabels = createdLabels => ({
  type: 'CREATE_LABELS',
  created: createdLabels,
})

export const createTheCircle = createdCircle => ({
  type: 'CREATE_CIRCLE',
  created: createdCircle,
})

export const createLabels = () => async (dispatch, getState) => {
  let response
  let labelsJson = {}
  const allErrors = []
  const state = getState()
  const { results } = state.repository
  results.results = state.repository.results
  for (const i in results.missingLabels) {
    if (results.missingLabels.hasOwnProperty(i)) {
      const missingLabel = {
        label_name: results.missingLabels[i].text,
        color: results.missingLabels[i].color.substr(1),
      }
      try {
        response = await fetch(
          `/api/repos/${results.repository.repo_name}/labels`,
          {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(missingLabel),
          }
        )
      } catch (e) {
        allErrors.push(
          `Erreur pendant la récupération des données du label "${
            results.missingLabels[i].text
          }"`
        )
      }
      if (response.status >= 200 && response.status < 300) {
        try {
          labelsJson = await response.json()
        } catch (e) {
          allErrors.push(
            `La réponse ne contient pas de json pour le label "${
              results.missingLabels[i].text
            }"`
          )
        }
        dispatch(createRepositoryLabels(labelsJson.object))
        dispatch(setMissingAndOverlyLabels())
      } else {
        allErrors.push(
          `Erreur [${response.status}] ${response.statusText} pour le label "${
            results.missingLabels[i].text
          }"`
        )
      }
    }
  }
  if (allErrors !== []) {
    dispatch(setErrorRepo(keyIndex(allErrors, 1)))
  }
}
export const createCircle = () => async (dispatch, getState) => {
  let response
  let circleJson = {}
  const allErrors = []
  const state = getState()
  // const { results } = state.repository
  // results.results = state.repository.results
  // for (const i in results.missingLabels) {
  // if (results.missingLabels.hasOwnProperty(i)) {
  // const missingLabel = {
  //   label_name: results.missingLabels[i].text,
  //   color: results.missingLabels[i].color.substr(1),
  // }
  try {
    response = await fetch('api/circles', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(response),
    })
  } catch (e) {
    console.log('erreur1 - create circle')
  }

  if (response.status >= 200 && response.status < 300) {
    try {
      circleJson = await response.json()
    } catch (e) {
      console.log('erreur2 - create circle')
    }
    dispatch(createTheCircle(circleJson.object))
    // dispatch(setMissingAndOverlyLabels())
  } else {
    console.log('erreur3 - create circle')
  }
  // }
  // }
  if (allErrors !== []) {
    dispatch(setErrorRepo(keyIndex(allErrors, 1)))
  }
}

export const deleteRepositoryLabels = deletedLabels => ({
  type: 'DELETE_LABELS',
  deleted: deletedLabels,
})

export const deleteLabels = () => async (dispatch, getState) => {
  let response
  const allErrors = []
  const state = getState()
  const { results } = state.repository
  results.results = state.repository.results
  const repoName = state.repository.results.repository.repo_name

  for (const i in results.overlyLabels) {
    if (results.overlyLabels.hasOwnProperty(i)) {
      const deleteLabel = results.overlyLabels[i]
      try {
        response = await fetch(
          `/api/repos/${repoName}/labels/${deleteLabel.label_name}`,
          {
            method: 'DELETE',
            credentials: 'same-origin',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
      } catch (e) {
        allErrors.push(
          `Erreur pendant la suppression du label "${
            results.missingLabels[i].text
          }"`
        )
      }
      if (response.status >= 200 && response.status < 300) {
        dispatch(deleteRepositoryLabels(deleteLabel))
        dispatch(setMissingAndOverlyLabels())
      } else {
        allErrors.push(
          `Erreur [${response.status}] ${response.statusText} pour le label "${
            deleteLabel.label_name
          }"`
        )
      }
    }
  }
  if (allErrors !== []) {
    dispatch(setErrorRepo(keyIndex(allErrors, 1)))
  }
}

export const toggleIssue = issueId => ({
  type: 'TOGGLE_ISSUE',
  issueId,
})

export const setIssuesSelectness = (issuesId, isSelected) => ({
  type: 'SET_ISSUES_SELECTNESS',
  issuesId,
  isSelected,
})

export const toggleExpanded = issueId => ({
  type: 'TOGGLE_EXPANDED',
  issueId,
})

export const toggleCommentsExpanded = issueId => ({
  type: 'TOGGLE_COMMENTS_EXPANDED',
  issueId,
})
