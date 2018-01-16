import { fetchResults, setError, setResults } from './index'

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

export const fetchCircleMilestones = () => async (dispatch, getState) => {
  let response
  const milestones = []
  const state = getState()
  const circle = state.circles.results.filter(
    c => c.circle_id === state.params.circle_id
  )

  if (circle.length > 0) {
    for (let i = 0; i < circle[0].circle_milestones.length; i++) {
      let { circleMilestones } = circle[0].circle_milestones[i]
      circleMilestones = circle[0].circle_milestones[i]
      try {
        response = await fetch(
          `/api/repos/${circleMilestones.repo_name}/milestones/${
            circleMilestones.milestone_number
          }`,
          {
            method: 'GET',
            credentials: 'same-origin',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
      } catch (e) {
        return dispatch(
          setError('Erreur pendant la mise à jour ', 'circleMilestones')
        )
      }
      if (response.status >= 200 && response.status < 300) {
        try {
          const json = await response.json()
          milestones.push(json.objects)
        } catch (e) {
          return dispatch(
            setError('La réponse ne contient pas de json', 'circleMilestones')
          )
        }
      } else {
        return dispatch(
          setError(
            `Erreur [${response.status}] ${response.statusText}`,
            'circleMilestones'
          )
        )
      }
    }
  }
  dispatch(setResults(milestones, 'circleMilestones'))
}
