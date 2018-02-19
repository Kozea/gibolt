import { changeRepository, setError } from './index'
import { setModal } from '../actions/issues'
import { sortMilestones } from '../utils'

export const setErrorCreate = error => ({
  type: 'SET_ERROR_CREATE',
  error,
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

export const updateCircle = circleId => ({
  type: 'UPDATE_CIRCLE_ID',
  circleId,
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

export const changeRolesSelect = (circleId = null, roles = []) => (
  dispatch,
  getState
) => {
  const state = getState()
  if (circleId !== null) {
    state.circles.results.find(circle => {
      if (circle.circle_id === +circleId) {
        // eslint-disable-next-line prefer-destructuring
        roles = circle.roles
      }
    })
  }
  roles.map(role =>
    state.users.results
      .filter(user => user.user_id === role.user_id)
      .map(user => (role.user_name = user.user_name))
  )
  dispatch(updateRolesSelect(roles))
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
      await response.json()
      return dispatch(setModal(false, false, null))
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
