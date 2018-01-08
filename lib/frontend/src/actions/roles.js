import { roleNameFromState } from '../utils'
import { setError, setResults, fetchResults } from './index'

export const createRole = data => async dispatch => {
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
      setError(`Erreur pendant la récupération des données, "${data}"`)
    )
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      await response.json()
      dispatch(fetchRoles())
      return history.go(-1)
    } catch (e) {
      return dispatch(
        setError(
          `La réponse ne contient pas de json pour le cercle "${
            data.role_name
          }"`
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

export const deleteRole = data => async dispatch => {
  let response
  try {
    response = await fetch(`api/roles/${data}`, {
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
      dispatch(fetchRoles())
      return history.go(-1)
    } catch (e) {
      return dispatch(
        setError(
          `La réponse ne contient pas de json pour le cercle "${
            data.role_name
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

export const fetchRole = () => async (dispatch, getState) => {
  let response
  let roleJson = {}
  const state = getState()
  const role = roleNameFromState(state)
  try {
    response = await fetch(`/api/roles/${+role.id}`, {
      method: 'GET',
      credentials: 'same-origin',
    })
  } catch (e) {
    return dispatch(
      setError('Erreur pendant la récupération des données du cercle', 'role')
    )
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      roleJson = await response.json()
    } catch (e) {
      return dispatch(setError('La réponse ne contient pas de json', 'role'))
    }
  } else {
    const jsonMessage = typeof roleJson === 'undefined' ? '' : roleJson.message
    return dispatch(
      setError(
        `${response.status}: ${response.statusText} ${jsonMessage}`,
        'repository'
      )
    )
  }
  return dispatch(setResults(roleJson.objects[0], 'role'))
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
      setError('Erreur pendant la récupération des données des roles')
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

export const updateRole = (roleId, data) => async dispatch => {
  let response, json
  try {
    response = await fetch(`/api/roles/${roleId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (e) {
    return dispatch(setError('Erreur pendant la mise à jour du role'))
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      json = await response.json()
      dispatch(fetchRoles())
      return history.go(-1)
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
      setError(`Erreur pendant la récupération des données, "${data}"`)
    )
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      await response.json()
      dispatch(fetchResults('items'))
    } catch (e) {
      return dispatch(
        setError(`La réponse ne contient pas de json pour : "${data.content}"`)
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
      setError(`Erreur pendant la récupération des données, "${data}"`)
    )
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      await response.json()
      dispatch(fetchResults('items'))
    } catch (e) {
      return dispatch(
        setError(`La réponse ne contient pas de json pour: "${data.content}"`)
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

export const fetchItems = () => async dispatch => {
  let response
  let itemsJson
  try {
    response = await fetch('/api/items', {
      method: 'GET',
      credentials: 'same-origin',
    })
  } catch (e) {
    return dispatch(
      setError('Erreur pendant la récupération des données des items')
    )
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      itemsJson = await response.json()
    } catch (e) {
      return dispatch(setError('La réponse ne contient pas de json', 'items'))
    }
  } else {
    const jsonMessage = typeof roleJson === 'undefined' ? '' : itemsJson.message
    return dispatch(
      setError(
        `${response.status}: ${response.statusText} ${jsonMessage}`,
        'roles'
      )
    )
  }
  return dispatch(setResults(itemsJson.objects, 'items'))
}

export const updateItem = (itemId, data) => async dispatch => {
  let response, json
  try {
    response = await fetch(`/api/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (e) {
    return dispatch(setError('Erreur pendant la mise à jour de l item'))
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      json = await response.json()
      dispatch(fetchItems())
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
