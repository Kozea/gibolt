import { setError, setResults } from './index'
import { roleFocusFromState } from '../utils'

export const fetchRoleFocus = () => async (dispatch, getState) => {
  let response
  let roleFocusJson = {}
  const state = getState()
  const roleFocus = roleFocusFromState(state)
  if (!roleFocus.role_focus_id) {
    return dispatch(
      setError('role_focus_id is missing or is not a number', 'roleFocus')
    )
  }
  try {
    response = await fetch(`/api/role_focuses/${+roleFocus.role_focus_id}`, {
      method: 'GET',
      credentials: 'same-origin',
    })
  } catch (e) {
    return dispatch(
      setError(
        'Erreur pendant la récupération des données du role',
        'roleFocus'
      )
    )
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      roleFocusJson = await response.json()
      return dispatch(setResults(roleFocusJson.objects[0], 'roleFocus'))
    } catch (e) {
      return dispatch(
        setError('La réponse ne contient pas de json', 'roleFocus')
      )
    }
  } else {
    const jsonMessage = typeof roleJson === 'undefined' ? '' : roleFocus.message
    return dispatch(
      setError(
        `${response.status}: ${response.statusText} ${jsonMessage}`,
        'roleFocus'
      )
    )
  }
}
