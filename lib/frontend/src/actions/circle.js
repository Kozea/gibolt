import { circleNameFromState } from '../utils'
import { setError, setResults } from './index'

export const fetchCircle = () => async (dispatch, getState) => {
  let response
  let circleJson = {},
    parentCircleJson = {}
  const state = getState()
  const circle = circleNameFromState(state)
  try {
    response = await fetch(`/api/circles/${+circle.circle_id}`, {
      method: 'GET',
      credentials: 'same-origin',
    })
  } catch (e) {
    return dispatch(
      setError('Erreur pendant la récupération des données du cercle', 'circle')
    )
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      circleJson = await response.json()
    } catch (e) {
      return dispatch(setError('La réponse ne contient pas de json', 'circle'))
    }
  } else {
    const jsonMessage =
      typeof circleJson === 'undefined' ? '' : circleJson.message
    return dispatch(
      setError(
        `${response.status}: ${response.statusText} ${jsonMessage}`,
        'circle'
      )
    )
  }
  if (circleJson.objects[0].parent_circle_id) {
    try {
      response = await fetch(
        `/api/circles/${circleJson.objects[0].parent_circle_id}`,
        {
          method: 'GET',
          credentials: 'same-origin',
        }
      )
    } catch (e) {
      return dispatch(
        setError(
          'Erreur pendant la récupération des données du cercle parent',
          'circle'
        )
      )
    }
    if (response.status >= 200 && response.status < 300) {
      try {
        parentCircleJson = await response.json()
        circleJson.objects[0].parent_circle_name =
          parentCircleJson.objects[0].circle_name
      } catch (e) {
        return dispatch(
          setError(
            'La réponse (cercle parent) ne contient pas de json',
            'circle'
          )
        )
      }
    } else {
      const jsonMessage =
        typeof parentCircleJson === 'undefined' ? '' : parentCircleJson.message
      return dispatch(
        setError(
          `${response.status}: ${response.statusText} ${jsonMessage}`,
          'repository'
        )
      )
    }
  }
  return dispatch(setResults(circleJson.objects[0], 'circle'))
}

export const toggleAccountExpanded = accountExpanded => ({
  type: 'TOGGLE_CIRCLE_ACCOUNT',
  accountExpanded,
})
export const toggleDomainExpanded = domainExpanded => ({
  type: 'TOGGLE_CIRCLE_DOMAIN',
  domainExpanded,
})
export const togglePurposeExpanded = purposeExpanded => ({
  type: 'TOGGLE_CIRCLE_PURPOSE',
  purposeExpanded,
})
