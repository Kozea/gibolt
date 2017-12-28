import { changeRepository, setError } from './index'
import { sortMilestones } from '../utils'

export const setErrorCreate = error => ({
  type: 'SET_ERROR_CREATE',
  error,
})

export const emptyForm = () => ({
  type: 'EMPTY_FORM',
})

export const updateRolesSelect = rolesSelect => ({
  type: 'UPDATE_ROLES_SELECT',
  rolesSelect,
})

export const updateMilestonesSelect = milestonesSelect => ({
  type: 'UPDATE_MILESTONES_SELECT',
  milestonesSelect,
})

export const updateProject = project => ({
  type: 'UPDATE_PROJET',
  project,
})

export const updateTitle = title => ({
  type: 'UPDATE_TITLE',
  title,
})

export const setParams = params => ({
  type: 'SET_FORM_PARAMS',
  params,
})

export const fetchRepositoryWithoutLabels = repoName => async dispatch => {
  let response
  let repositoryJson = {}
  try {
    response = await fetch(`/api/repos/${repoName}`, {
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
  dispatch(changeRepository(repositoryJson.objects, []))
}

export const changeMilestoneSelect = repoName => async dispatch => {
  dispatch(updateProject(repoName))
  let response
  let milestonesJson = {}
  try {
    response = await fetch(`/api/repos/${repoName}/milestones`, {
      method: 'GET',
      credentials: 'same-origin',
    })
  } catch (e) {
    return dispatch(
      setError('Erreur pendant la récupération des milestones', 'issueForm')
    )
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      milestonesJson = await response.json()
      dispatch(updateMilestonesSelect(sortMilestones(milestonesJson.objects)))
    } catch (e) {
      return dispatch(
        setError('La réponse ne contient pas de json', 'issueForm')
      )
    }
  } else {
    const jsonMessage =
      typeof milestonesJson === 'undefined' ? '' : milestonesJson.message
    return dispatch(
      setError(
        `${response.status}: ${response.statusText} ${jsonMessage}`,
        'issueForm'
      )
    )
  }
}

export const changeRolesSelect = circleId => (dispatch, getState) => {
  const state = getState()
  state.circles.results.find(circle => {
    if (circle.circle_id === +circleId) {
      dispatch(updateRolesSelect(circle.roles))
    }
  })
}

export const submitIssue = event => async (dispatch, getState) => {
  let response, json
  const state = getState()
  const newIssue = {
    title: event.target.form.title.value,
    state: 'open',
    labels: [event.target.form.priority.value],
  }

  if (
    event.target.form.milestone.value !== '' &&
    !isNaN(+event.target.form.milestone.value)
  ) {
    newIssue.milestone = +event.target.form.milestone.value
  }

  if (event.target.form.roles.value !== '') {
    const assignee = state.users.results.filter(
      user => user.user_id === +event.target.form.roles.value
    )
    newIssue.assignees = [assignee[0].user_name]
  }

  if (event.target.form.body.value !== '') {
    newIssue.body = event.target.form.body.value
  }

  const selectedCircle = state.circles.results.filter(
    circle => circle.circle_id === +event.target.form.circle.value
  )
  if (selectedCircle[0]) {
    newIssue.labels.push(selectedCircle[0].circle_name)
  }
  try {
    response = await fetch(
      `/api/repos/${event.target.form.project.value}/tickets`,
      {
        method: 'POST',
        body: JSON.stringify(newIssue),
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (e) {
    return dispatch(setErrorCreate('Erreur pendant la création du ticket'))
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      json = await response.json()
      return dispatch(goBack())
    } catch (e) {
      console.error(e)
      return dispatch(setErrorCreate('La réponse ne contient pas de json'))
    }
  }
  const jsonMessage = typeof json === 'undefined' ? '' : json.message
  return dispatch(
    setErrorCreate(`${response.status}: ${response.statusText} ${jsonMessage}`)
  )
}

export const goBack = () => dispatch => {
  dispatch(emptyForm())
  if (history.length === 1) {
    window.location.href = '/'
  } else {
    history.go(-1)
  }
}
