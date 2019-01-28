import { changeRepository, setError, setModal } from './index'
import { sortFocusUsers } from './rolefocus'
import { sortMilestones } from '../utils'

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
        'issueForm'
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
        'issueForm'
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
        roles = circle.roles.filter(
          role =>
            role.is_active === true &&
            role.role_focuses.find(focus => focus.role_focus_users.length > 0)
        )
      }
    })
  }
  roles.map(role =>
    role.role_focuses.map(focus => {
      focus.role_focus_users = sortFocusUsers(focus.role_focus_users)
      return (focus.role_focus_users[0].user_name = state.users.results.filter(
        user => user.user_id === focus.role_focus_users[0].user_id
      )[0].user_name)
    })
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
    newIssue.assignees = [event.target.form.roles.value]
  }

  if (event.target.form.body.value !== '') {
    newIssue.body = event.target.form.body.value
  }

  const selectedCircle = state.circles.results
    .filter(circle => circle.circle_id === +event.target.form.circle.value)
    .map(
      circle =>
        state.labels.results.circle
          .filter(label => label.label_id === circle.label_id)
          .map(label => label.text)[0]
    )
  if (selectedCircle[0]) {
    newIssue.labels.push(selectedCircle[0])
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
    return dispatch(
      setError('Erreur pendant la création du ticket'),
      'issueForm'
    )
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      await response.json()
      dispatch(updateCircle(''))
      return dispatch(setModal(false, false, {}))
    } catch (e) {
      console.error(e)
      return dispatch(
        setError('La réponse ne contient pas de json'),
        'issueForm'
      )
    }
  }
  const jsonMessage = typeof json === 'undefined' ? '' : json.message
  return dispatch(
    setError(
      `${response.status}: ${response.statusText} ${jsonMessage}`,
      'issueForm'
    )
  )
}
