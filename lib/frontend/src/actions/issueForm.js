import { setError } from './index'

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
      setError('Erreur pendant la récupération des milestons', 'repository')
    )
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      milestonesJson = await response.json()
      dispatch(updateMilestonesSelect(milestonesJson.objects))
    } catch (e) {
      return dispatch(setError('La réponse ne contient pas de json', 'circle'))
    }
  } else {
    const jsonMessage =
      typeof milestonesJson === 'undefined' ? '' : milestonesJson.message
    return dispatch(
      setError(
        `${response.status}: ${response.statusText} ${jsonMessage}`,
        'repository'
      )
    )
  }
}
