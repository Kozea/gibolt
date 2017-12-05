import equal from 'deep-equal'
import fetch from 'isomorphic-fetch'

import {
  allLabelsFromState,
  querystringize,
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

export const setModifier = (modifier, state) => ({
  type: 'SET_MODIFIER',
  modifier,
  state,
})

export const changeRepository = (newRepository, newLabels) => ({
  type: 'CHANGE_REPOSITORY',
  newRepository,
  newLabels,
})

const stateToParams = (state, target) => {
  let users
  switch (target) {
    case 'issues':
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
    case 'repository':
      return repositoryNameFromState(state)
  }
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
  try {
    const state = getState()
    if (target === 'repositories') {
      const apiTarget = 'repos'
      const params = querystringize(stateToParams(state, apiTarget))
      response = await fetch(`/api/${apiTarget}?${params}`, {
        method: 'GET',
        credentials: 'same-origin',
      })
    } else if (target === 'repository') {
      return dispatch(fetchRepository())
    } else {
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
    return dispatch(setError('Erreur pendant la récupération des données'))
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      json = await response.json()
    } catch (e) {
      return dispatch(setError('La réponse ne contient pas de json'))
    }
    if (target === 'repositories') {
      return dispatch(setResults(json.results, target))
    }
    return dispatch(maybeSetResults(json, target))
  }
  try {
    json = await response.json()
  } catch (e) {
    return dispatch(setError('La réponse ne contient pas de json'))
  }
  return dispatch(
    setError(
      `${response.status}: ${response.statusText} ${json.message}`,
      target
    )
  )
}

export const fetchRepository = () => async (dispatch, getState) => {
  let response, json
  let repositoryJson = {}
  let labelsJson = {}
  try {
    const state = getState()
    const repoName = repositoryNameFromState(state)
    response = await fetch(`/api/repos/${repoName.name}`, {
      method: 'GET',
      credentials: 'same-origin',
    })
  } catch (e) {
    return dispatch(
      setError('Erreur pendant la récupération des données du repository')
    )
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      repositoryJson = await response.json()
    } catch (e) {
      return dispatch(setError('La réponse ne contient pas de json'))
    }
  } else {
    return dispatch(
      setError(`${response.status}: ${response.statusText} ${json.message}`)
    )
  }
  try {
    const state = getState()
    const repoName = repositoryNameFromState(state)
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
      return dispatch(setError('La réponse ne contient pas de json'))
    }
    return dispatch(
      changeRepository(repositoryJson.objects, labelsJson.objects)
    )
  }
  try {
    json = await response.json()
  } catch (e) {
    return dispatch(setError('La réponse ne contient pas de json'))
  }
  return dispatch(
    setError(
      `${response.status}: ${response.statusText} ${json.message}`,
      'repository'
    )
  )
}

export const postChangeSelectedIssuesPriority = change => (
  dispatch,
  getState
) => {
  const state = getState()
  fetch('/api/apply_labels', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },

    body: JSON.stringify({
      issues: state.issues.results.issues
        .filter(issue => issue.selected)
        .map(issue => ({ url: issue.url, labels: issue.labels })),
      action: change,
    }),
  })
    .then(response => {
      if (response.status >= 200 && response.status < 300) {
        return response
      }
      response.text().then(text => {
        throw new Error(`[${response.status}] ${response.statusText} ${text}`)
      })
    })
    .then(response => response.json())
    .then(() => dispatch(fetchResults('issues')))
}

export const createRepositoryLabels = createdLabels => ({
  type: 'CREATE_LABELS',
  created: createdLabels,
})

export const createLabels = () => (dispatch, getState) => {
  const state = getState()
  const results = state.repository.results
  const confLabels = state.labels.results.priority.concat(
    state.labels.results.ack,
    state.labels.results.qualifier
  )
  const missingLabels = confLabels.filter(
    confLabel =>
      results.labels
        .map(resultLabel => resultLabel.label_name)
        .indexOf(confLabel.text) === -1
  )
  for (const i in missingLabels) {
    if (missingLabels.hasOwnProperty(i)) {
      const missingLabel = {
        label_name: missingLabels[i].text,
        color: missingLabels[i].color.substr(1),
      }
      fetch(`/api/repos/${results.repository.repo_name}/labels`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(missingLabel),
      })
        .then(response => {
          if (response.status >= 200 && response.status < 300) {
            return response
          }
          throw new Error(`[${response.status}] ${response.statusText}`)
        })
        .then(response => response.json())
        .then(json => dispatch(createRepositoryLabels(json.created)))
    }
  }
}

export const deleteRepositoryLabels = deletedLabels => ({
  type: 'DELETE_LABELS',
  deleted: deletedLabels,
})

export const deleteLabels = () => (dispatch, getState) => {
  const state = getState()
  fetch('/api/repository/delete_labels', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      labels: state.repository.results.overlyLabels,
      name: repositoryNameFromState(state).name,
    }),
  })
    .then(response => {
      if (response.status >= 200 && response.status < 300) {
        return response
      }
      throw new Error(`[${response.status}] ${response.statusText}`)
    })
    .then(response => response.json())
    .then(json => dispatch(deleteRepositoryLabels(json.deleted)))
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
