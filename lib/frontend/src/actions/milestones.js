import { fetchResults, setError } from './index'

export const milestoneOnEdition = milestoneId => ({
  type: 'MILESTONE_EDITION_STATUS_UPDATE',
  milestoneId,
})

export const updateMilestoneCircles = (
  milestoneId,
  selectedCircles
) => async dispatch => {
  let response
  try {
    response = await fetch(`api/milestone_circles/${milestoneId}`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(selectedCircles),
    })
  } catch (e) {
    return dispatch(setError('Erreur pendant la mise à jour ', 'timeline'))
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      await response.json()
      dispatch(fetchResults('timeline'))
    } catch (e) {
      return dispatch(
        setError('La réponse ne contient pas de json', 'timeline')
      )
    }
  } else {
    return dispatch(
      setError(`Erreur [${response.status}] ${response.statusText}`, 'timeline')
    )
  }
}
