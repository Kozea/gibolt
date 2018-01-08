import { circleNameFromState } from '../utils'
import { editCircle, setError, setResults } from './index'

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
      setError(`Erreur pendant la récupération
         des données, "${data.circle_name}"`)
    )
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      await response.json()
      return history.go(-1)
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
  let response
  let circleJson = {},
    parentCircleJson = {},
    childrenCircleJson = {},
    reportsJson = {}
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

  // get circle's parent
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

  // get circle's children
  try {
    response = await fetch(
      `/api/circles?parent_circle_id=${circle.circle_id}`,
      {
        method: 'GET',
        credentials: 'same-origin',
      }
    )
  } catch (e) {
    return dispatch(
      setError('Erreur pendant la récupération des données du cercle', 'circle')
    )
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      childrenCircleJson = await response.json()
      circleJson.objects[0].children_circles = childrenCircleJson.objects
    } catch (e) {
      return dispatch(setError('La réponse ne contient pas de json', 'circle'))
    }
  } else {
    const jsonMessage =
      typeof childrenCircleJson === 'undefined'
        ? ''
        : childrenCircleJson.message
    return dispatch(
      setError(
        `${response.status}: ${response.statusText} ${jsonMessage}`,
        'circle'
      )
    )
  }

  // check if a circle has report
  try {
    response = await fetch(`/api/reports?circle_id=${circle.circle_id}`, {
      method: 'GET',
      credentials: 'same-origin',
    })
  } catch (e) {
    return dispatch(
      setError(
        'Erreur pendant la récupération des rapports du cercle',
        'circle'
      )
    )
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      reportsJson = await response.json()
      circleJson.objects[0].nb_reports = reportsJson.occurences
    } catch (e) {
      return dispatch(setError('La réponse ne contient pas de json', 'circle'))
    }
  } else {
    const jsonMessage =
      typeof reportsJson === 'undefined' ? '' : reportsJson.message
    return dispatch(
      setError(
        `${response.status}: ${response.statusText} ${jsonMessage}`,
        'circle'
      )
    )
  }
  return dispatch(setResults(circleJson.objects[0], 'circle'))
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
      return history.go(-1)
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

export const updateCircle = (circleId, data) => async (dispatch, getState) => {
  let response, json
  const state = getState()
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
      json = await response.json()
      if (state.circle.is_in_edition) {
        dispatch(editCircle())
      }
      return dispatch(fetchCircle())
    } catch (e) {
      return dispatch(setError('La réponse ne contient pas de json'))
    }
  } else {
    const jsonMessage = typeof json === 'undefined' ? '' : json.message
    return dispatch(
      setError(
        `${response.status}: ${response.statusText} ${jsonMessage}`,
        'circle'
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
