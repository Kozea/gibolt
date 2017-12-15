import fetch from 'isomorphic-fetch'
import keyIndex from 'react-key-index'

import { stateToParams, setError, setResults } from './index'
import { querystringize } from '../utils'

// specific error until all merge
export const setErrorIssue = errors => ({
  type: 'SET_ERROR_ISSUE',
  errors,
})

export const fetchIssues = () => async (dispatch, getState) => {
  let response
  let ticketsJson = {},
    commentsJson = {}
  const allErrors = []
  const state = getState()
  const params = querystringize(stateToParams(state, 'tickets'))
  try {
    response = await fetch(`/api/tickets?${params}`, {
      method: 'GET',
      credentials: 'same-origin',
    })
  } catch (e) {
    return dispatch(
      setError(
        'Erreur pendant la récupération des données des tickets',
        'repository'
      )
    )
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      ticketsJson = await response.json()
    } catch (e) {
      return dispatch(setError('La réponse ne contient pas de json', 'issues'))
    }
  } else {
    const jsonMessage =
      typeof ticketsJson === 'undefined' ? '' : ticketsJson.message
    return dispatch(
      setError(
        `${response.status}: ${response.statusText} ${jsonMessage}`,
        'repository'
      )
    )
  }
  for (const index in ticketsJson.objects) {
    if (ticketsJson.objects.hasOwnProperty(index)) {
      if (ticketsJson.objects[index].nb_comments > 0) {
        try {
          response = await fetch(
            `/api/repos/${ticketsJson.objects[index].repo_name}/tickets/${
              ticketsJson.objects[index].ticket_number
            }/comments`,
            {
              method: 'GET',
              credentials: 'same-origin',
            }
          )
        } catch (e) {
          allErrors.push(
            `Erreur pendant la récupération des commentaires du ticket ${
              ticketsJson.objects[index].ticket_number
            }`
          )
        }
        if (response.status < 200 || response.status >= 300) {
          allErrors.push(
            `Erreur [${response.status}] ${
              response.statusText
            } pour les commentaires du ticket ${
              ticketsJson.objects[index].ticket_number
            }`
          )
          ticketsJson.objects[index].comments = []
          continue
        }
        try {
          commentsJson = await response.json()
        } catch (e) {
          allErrors.push(
            'Erreur pendant la récupération des commentaires du' +
              ` ticket ${ticketsJson.objects[index].ticket_number}`
          )
        }
        ticketsJson.objects[index].comments = commentsJson.objects
      } else {
        ticketsJson.objects[index].comments = []
      }
    }
  }
  dispatch(setResults({ ['issues']: ticketsJson.objects }, 'issues'))
  if (allErrors.length > 0) {
    dispatch(setErrorIssue(keyIndex(allErrors, 1)))
  }
}
