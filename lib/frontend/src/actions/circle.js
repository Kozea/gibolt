import { circleNameFromState } from '../utils'
import { setError, setResults, fetchResults } from './index'

export const createCircle = data => async dispatch => {
  let response
  try {
    response = await fetch('api/circles', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
  } catch (e) {
    return dispatch(
      setError(`Erreur pendant la récupération des données, "${data}"`)
    )
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      await response.json()
    } catch (e) {
      return dispatch(
        setError(
          `La réponse ne contient pas de json pour le cercle "${
            data.circle_name
          }"`
        )
      )
    }
  } else {
    return dispatch(
      setError(
        `Erreur [${response.status}] ${response.statusText} pour : "${data}"`,
        'circle'
      )
    )
  }
}

export const fetchCircle = () => async (dispatch, getState) => {
  console.log('fetch')
  let response
  let circleJson = {},
    parentCircleJson = {}
  const state = getState()
  const circle = circleNameFromState(state)
  try {
    response = await fetch(`/api/circle/${circle.name}`, {
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
        'repository'
      )
    )
  }
  if (circleJson.objects.parent_circle_id) {
    try {
      response = await fetch(
        `/api/circles/${circleJson.objects.parent_circle_id}`,
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
        circleJson.objects.parent_circle_name =
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
  return dispatch(setResults(circleJson.objects, 'circle'))
}

export const deleteCircle = data => async dispatch => {
  let response
  try {
    response = await fetch(`api/circles/${data}`, {
      method: 'DELETE',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (e) {
    return dispatch(
      setError(`Erreur pendant la récupération des données, "${data}"`)
    )
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      await response.json()
      // ici fair le retour vers circles
      // dispatch(fetchResults('circles'))
    } catch (e) {
      return dispatch(
        setError(
          `La réponse ne contient pas de json pour le cercle "${
            data.circle_name
          }"`
        )
      )
    }
  } else {
    return dispatch(
      setError(
        `Erreur [${response.status}] ${response.statusText} pour : "${data}"`
      )
    )
  }
}

export const updateCircle = (circleId, data) => async dispatch => {
  let response
  // json
  try {
    response = await fetch(`/api/circles/${circleId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (e) {
    return dispatch(setError('Erreur pendant la mise à jour du cercle'))
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      // json =
      await response.json()
    } catch (e) {
      return dispatch(setError('La réponse ne contient pas de json'))
    }
  }
  return dispatch(
    setError(
      `${response.status}: ${response.statusText} `,
      // ${json.message}
      'issues'
    )
  )
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
