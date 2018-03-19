import { roleNameFromState } from '../utils'
import { setError, setResults } from './index'
import { getUserInfos } from './circle'

export const editRole = () => ({
  type: 'EDIT_ROLE',
})

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

export const checkForm = () => ({
  type: 'CHECKLIST_ITEM',
})

export const indicatorForm = () => ({
  type: 'INDICATOR_ITEM',
})

export const createRole = (data, history) => async dispatch => {
  let response
  try {
    response = await fetch('api/roles', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
  } catch (e) {
    return dispatch(
      setError(`Erreur pendant la création du rôle, "${data}"`, 'role')
    )
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      const roleJson = await response.json()
      return history.push(`/role?role_id=${roleJson.objects[0].role_id}`)
    } catch (e) {
      return dispatch(
        setError(
          `La réponse ne contient pas de json pour le cercle "${
            data.role_name
          }"`,
          'role'
        )
      )
    }
  } else {
    return dispatch(
      setError(
        `Erreur [${response.status}] ${response.statusText} pour : "${data}"`,
        'role'
      )
    )
  }
}

export const deleteRole = (roleId, circleId, history) => async dispatch => {
  let response
  try {
    response = await fetch(`api/roles/${roleId}`, {
      method: 'DELETE',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (e) {
    console.error(e)
    return dispatch(
      setError(`Erreur pendant la suppression du role "${roleId}"`, 'role')
    )
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      await response.json()
      return history.push(`/circle?circle_id=${circleId}`)
    } catch (e) {
      console.error(e)
      return dispatch(
        setError(
          `La réponse ne contient pas de json pour le cercle "${
            roleId.role_name
          }"`,
          'role'
        )
      )
    }
  } else {
    return dispatch(
      setError(
        `Erreur [${response.status}] ${response.statusText} pour : "${roleId}"`,
        'role'
      )
    )
  }
}

export const fetchRole = () => async (dispatch, getState) => {
  let response
  let roleJson = {}
  const state = getState()
  const role = roleNameFromState(state)
  if (!role.role_id) {
    return dispatch(setError('role_id is missing or is not a number', 'role'))
  }
  try {
    response = await fetch(`/api/roles/${+role.role_id}`, {
      method: 'GET',
      credentials: 'same-origin',
    })
  } catch (e) {
    return dispatch(
      setError('Erreur pendant la récupération des données du role', 'role')
    )
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      roleJson = await response.json()
      for (let i = 0; i < roleJson.objects[0].role_focuses.length; i++) {
        roleJson.objects[0].role_focuses[i] = getUserInfos(
          roleJson.objects[0].role_focuses[i],
          state.users.results
        )
      }
      dispatch(setResults(roleJson.objects[0], 'role'))
      return dispatch(fetchItems(+role.role_id))
    } catch (e) {
      return dispatch(setError('La réponse ne contient pas de json', 'role'))
    }
  } else {
    const jsonMessage = typeof roleJson === 'undefined' ? '' : roleJson.message
    return dispatch(
      setError(
        `${response.status}: ${response.statusText} ${jsonMessage}`,
        'role'
      )
    )
  }
}

export const fetchRoles = () => async dispatch => {
  let response
  let roleJson
  try {
    response = await fetch('/api/roles', {
      method: 'GET',
      credentials: 'same-origin',
    })
  } catch (e) {
    return dispatch(
      setError('Erreur pendant la récupération des données des roles', 'roles')
    )
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      roleJson = await response.json()
    } catch (e) {
      return dispatch(setError('La réponse ne contient pas de json', 'roles'))
    }
  } else {
    const jsonMessage = typeof roleJson === 'undefined' ? '' : roleJson.message
    return dispatch(
      setError(
        `${response.status}: ${response.statusText} ${jsonMessage}`,
        'roles'
      )
    )
  }
  return dispatch(setResults(roleJson.objects, 'roles'))
}

export const updateRole = (roleId, data, history) => async dispatch => {
  let response, json
  try {
    response = await fetch(`/api/roles/${roleId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (e) {
    return dispatch(setError('Erreur pendant la mise à jour du role'), 'role')
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      json = await response.json()
      dispatch(fetchRole())
      return history.push(`/role?role_id=${roleId}`)
    } catch (e) {
      return dispatch(setError('La réponse ne contient pas de json', 'role'))
    }
  } else {
    const jsonMessage = typeof json === 'undefined' ? '' : json.message
    return dispatch(
      setError(
        `${response.status}: ${response.statusText} ${jsonMessage}`,
        'role'
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
      setError(`Erreur pendant la création de l'item, "${data}"`, 'role')
    )
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      await response.json()
      return dispatch(fetchItems())
    } catch (e) {
      return dispatch(
        setError(
          `La réponse ne contient pas de json pour : "${data.content}"`,
          'role'
        )
      )
    }
  } else {
    return dispatch(
      setError(
        `Erreur [${response.status}] ${response.statusText} pour : "${data}"`,
        'role'
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
      setError(`Erreur pendant la suppression de l'item, "${data}"`, 'role')
    )
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      await response.json()
      return dispatch(fetchItems())
    } catch (e) {
      return dispatch(
        setError(
          `La réponse ne contient pas de json pour: "${data.content}"`,
          'role'
        )
      )
    }
  } else {
    return dispatch(
      setError(
        `Erreur [${response.status}] ${response.statusText} pour : "${data}"`,
        'role'
      )
    )
  }
}

export const fetchItems = () => async (dispatch, getState) => {
  let response, itemsJson
  const state = getState()
  const role = roleNameFromState(state)
  try {
    response = await fetch(`/api/items?role_id=${role.role_id}`, {
      method: 'GET',
      credentials: 'same-origin',
    })
  } catch (e) {
    return dispatch(
      setError('Erreur pendant la récupération des données des items'),
      'role'
    )
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      itemsJson = await response.json()
      return dispatch(setResults(itemsJson.objects, 'items'))
    } catch (e) {
      return dispatch(setError('La réponse ne contient pas de json', 'role'))
    }
  } else {
    const jsonMessage = typeof roleJson === 'undefined' ? '' : itemsJson.message
    return dispatch(
      setError(
        `${response.status}: ${response.statusText} ${jsonMessage}`,
        'role'
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
    return dispatch(setError('Erreur pendant la mise à jour de l item'), 'role')
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      json = await response.json()
      return dispatch(fetchItems())
    } catch (e) {
      return dispatch(setError('La réponse ne contient pas de json'))
    }
  } else {
    const jsonMessage = typeof json === 'undefined' ? '' : json.message
    return dispatch(
      setError(
        `${response.status}: ${response.statusText} ${jsonMessage}`,
        'roles'
      )
    )
  }
}

export const dispatchForm = itemType => dispatch => {
  switch (itemType) {
    case 'indicator':
      dispatch(indicatorForm())
      break
    case 'checklist':
      dispatch(checkForm())
      break
  }
}
