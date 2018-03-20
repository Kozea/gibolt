import { setError, setResults } from './index'
import { roleFocusFromState } from '../utils'

export function editClickItem(itemId) {
  return {
    type: 'EDIT_ITEM',
    itemId: itemId,
  }
}

export function cancelClickItem(itemId) {
  return {
    type: 'CANCEL_ITEM',
    itemId: itemId,
  }
}

const splitItems = focus => {
  const actionsList = [],
    intdicatorsList = []
  focus.items.map(item => {
    if (item.item_type === 'checklist') {
      actionsList.push(item)
    } else {
      intdicatorsList.push(item)
    }
  })
  focus.actions = actionsList
  focus.indicators = intdicatorsList
  delete focus.items
  return focus
}

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

      if (roleFocusJson.objects[0].role_focus_users.length > 0) {
        const currentUserId =
          roleFocusJson.objects[0].role_focus_users[0].user_id
        const currentUser = state.users.results.find(
          user => user.user_id === currentUserId
        )
        roleFocusJson.objects[0].role_focus_users[0].user_name =
          currentUser.user_name
        roleFocusJson.objects[0].role_focus_users[0].avatar_url =
          currentUser.avatar_url
      } else {
        roleFocusJson.objects[0].role_focus_users[0].user_name = null
        roleFocusJson.objects[0].role_focus_users[0].avatar_url = null
      }
      return dispatch(
        setResults(splitItems(roleFocusJson.objects[0]), 'roleFocus')
      )
    } catch (e) {
      console.error(e)
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

export const addItem = data => async dispatch => {
  let response
  try {
    response = await fetch('api/items', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
  } catch (e) {
    return dispatch(
      setError(`Erreur pendant la création de l'item, "${data}"`, 'roleFocus')
    )
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      await response.json()
      return dispatch(fetchRoleFocus())
    } catch (e) {
      return dispatch(
        setError(
          `La réponse ne contient pas de json pour : "${data.content}"`,
          'roleFocus'
        )
      )
    }
  } else {
    return dispatch(
      setError(
        `Erreur [${response.status}] ${response.statusText} pour : "${data}"`,
        'roleFocus'
      )
    )
  }
}

export const delItem = data => async dispatch => {
  let response
  try {
    response = await fetch(`api/items/${data}`, {
      method: 'DELETE',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (e) {
    return dispatch(
      setError(
        `Erreur pendant la suppression de l'item, "${data}"`,
        'roleFocus'
      )
    )
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      await response.json()
      return dispatch(fetchRoleFocus())
    } catch (e) {
      return dispatch(
        setError(
          `La réponse ne contient pas de json pour: "${data.content}"`,
          'roleFocus'
        )
      )
    }
  } else {
    return dispatch(
      setError(
        `Erreur [${response.status}] ${response.statusText} pour : "${data}"`,
        'roleFocus'
      )
    )
  }
}

export const updateItem = (itemId, data) => async dispatch => {
  let response, json
  try {
    response = await fetch(`/api/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (e) {
    return dispatch(
      setError("Erreur pendant la mise à jour de l'item"),
      'roleFocus'
    )
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      json = await response.json()
      return dispatch(fetchRoleFocus())
    } catch (e) {
      return dispatch(
        setError('La réponse ne contient pas de json', 'roleFocus')
      )
    }
  } else {
    const jsonMessage = typeof json === 'undefined' ? '' : json.message
    return dispatch(
      setError(
        `${response.status}: ${response.statusText} ${jsonMessage}`,
        'roleFocus'
      )
    )
  }
}
