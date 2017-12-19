import { setError } from './index'
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

export const changeRolesSelect = circleId => (dispatch, getState) => {
  const state = getState()
  state.circles.results.find(circle => {
    if (circle.circle_id === parseInt(circleId)) {
      dispatch(updateRolesSelect(circle.roles))
    }
  })
}

export const updateMilestonesSelect = milestonesSelect => ({
  type: 'UPDATE_MILESTONES_SELECT',
  milestonesSelect,
})

export const changeMilestoneSelect = repoId => async dispatch => {
  let response
  let milestonesJson = {}
  try {
    response = await fetch(`/api/repos/${repoId}/milestones`, {
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

export const submitIssue = event => async (dispatch, getState) => {
  let response, json
  const state = getState()
  const selectedCircle = state.circles.results.filter(
    circle => circle.circle_id === parseInt(event.target.form.circle.value)
  )
  const newIssue = {
    title: event.target.form.title.value,
    state: 'open',
    labels: [selectedCircle[0].circle_name, event.target.form.priority.value],
  }
  if (!isNaN(parseInt(event.target.form.milestone.value))) {
    newIssue.milestone = parseInt(event.target.form.milestone.value)
  }
  if (event.target.form.roles.value !== '') {
    const assignee = state.users.results.filter(
      user => user.user_id === parseInt(event.target.form.roles.value)
    )
    newIssue.assignees = [assignee[0].user_name]
  }
  if (event.target.form.body.value !== '') {
    newIssue.body = event.target.form.body.value
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
      dispatch(goBack())
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
  history.go(-1)
}
