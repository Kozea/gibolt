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

export const setParams = params => ({
  type: 'SET_PARAMS',
  params,
})

export const updateMarkdown = content => ({
  type: 'UPDATE_MARKDOWN',
  content,
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

export const updateSelectedRepos = selectedRepositories => ({
  type: 'UPDATE_SELECTED_REPO',
  selectedRepositories,
})

export const emptySelectedRepos = () => ({
  type: 'EMPTY_SELECTED_REPO',
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
      // should be the default case, after all merge
      case 'users':
      case 'labels':
      case 'circles':
      case 'meetingsTypes':
      case 'roles':
      case 'items':
        response = await fetch(`/api/${target}`, {
          method: 'GET',
          credentials: 'same-origin',
        })
        break
      case 'meetings':
        response = await fetch(`/api/reports${state.router.location.search}`, {
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
    } catch (e) {
      return dispatch(setError('La réponse ne contient pas de json', target))
    }
    if (isOldRoute || target === 'report') {
      return dispatch(maybeSetResults(json, target))
    }
    if (target === 'labels') {
      json.objects.priority.sort((a, b) => a.priority - b.priority)
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
  let response
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
    const jsonMessage =
      typeof repositoryJson === 'undefined' ? '' : repositoryJson.message
    return dispatch(
      setError(
        `${response.status}: ${response.statusText} ${jsonMessage}`,
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
        'Erreur pendant la récupération des données des labels du repository',
        'repository'
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

export const createRepositoryLabels = createdLabels => ({
  type: 'CREATE_LABELS',
  created: createdLabels,
})

export const createLabels = results => async dispatch => {
  let response
  let labelsJson = {}
  const allErrors = []
  const repoName = results.repository.repo_name
  for (const i in results.missingLabels) {
    if (results.missingLabels.hasOwnProperty(i)) {
      const missingLabel = {
        label_name: results.missingLabels[i].text,
        color: results.missingLabels[i].color.substr(1),
      }
      try {
        response = await fetch(`/api/repos/${repoName}/labels`, {
          method: 'POST',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(missingLabel),
        })
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
export const deleteRepositoryLabels = deletedLabels => ({
  type: 'DELETE_LABELS',
  deleted: deletedLabels,
})

export const deleteLabels = results => async dispatch => {
  let response
  const allErrors = []
  const repoName = results.repository.repo_name
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

export const goBack = history => (dispatch, getState) => {
  const state = getState()
  if (history.length === 1) {
    switch (state.router.location.pathname) {
      case '/circle':
        history.push('/circles')
        break
      default:
        history.push('/')
    }
  } else {
    history.go(-1)
  }
}

export const updateRepoList = (checked, repo) => (dispatch, getState) => {
  const state = getState()
  const { selectedRepositories } = state.repositories
  selectedRepositories.selectedRepositories =
    state.repositories.selectedRepositories
  if (checked) {
    selectedRepositories.push(repo)
  } else {
    const index = state.repositories.selectedRepositories.indexOf(repo)
    selectedRepositories.splice(index, 1)
  }
  dispatch(updateSelectedRepos(selectedRepositories))
}

export const updateReposLabels = () => (dispatch, getState) => {
  const state = getState()
  const { selectedRepositories } = state.repositories
  selectedRepositories.selectedRepositories =
    state.repositories.selectedRepositories
  const promises = []
  for (let i = 0; i < selectedRepositories.length; i++) {
    // repo_name already exists, the line below allows to use the same
    // functions for Repositories.jsx and Repository.jsx
    selectedRepositories[i].repository = {
      repo_name: selectedRepositories[i].repo_name,
    }
    if (selectedRepositories[i].missingLabels) {
      promises.push(dispatch(createLabels(selectedRepositories[i])))
    }
    if (selectedRepositories[i].overlyLabels) {
      promises.push(dispatch(deleteLabels(selectedRepositories[i])))
    }
  }
  Promise.all(promises).then(() => {
    dispatch(fetchResults('repositories'))
    dispatch(emptySelectedRepos())
  })
}
