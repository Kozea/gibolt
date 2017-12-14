import { circleNameFromState } from '../utils'
import { setError, setResults } from './index'

export const fetchCircle = () => async (dispatch, getState) => {
  let response
  let circleJson = {}
  const state = getState()
  const circle = circleNameFromState(state)
  try {
    response = await fetch(`/api/circle/${circle.name}`, {
      method: 'GET',
      credentials: 'same-origin',
    })
  } catch (e) {
    return dispatch(
      setError(
        'Erreur pendant la récupération des données du repository',
        'circle'
      )
    )
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      circleJson = await response.json()
      return dispatch(setResults(circleJson.objects, 'circle'))
    } catch (e) {
      return dispatch(setError('La réponse ne contient pas de json', 'circle'))
    }
  } else {
    const jsonMessage =
      typeof circleJson === 'undefined' ? '' : circleJson.message
    return dispatch(
      setError(
        `${response.status}: ${response.statusText} ${jsonMessage}`,
        'repository'
      )
    )
  }
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
