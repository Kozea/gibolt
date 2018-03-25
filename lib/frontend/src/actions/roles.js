import { roleNameFromState } from '../utils'
import { setError, setResults } from './index'
import { getUserInfos } from './circle'

export const editRole = () => ({
  type: 'EDIT_ROLE',
})

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

export const disableRole = role => async dispatch => {
  let response
  try {
    response = await fetch(`api/roles/${role.role_id}`, {
      method: 'PATCH',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ is_active: !role.is_active }),
    })
  } catch (e) {
    console.error(e)
    return dispatch(setError('Erreur pendant la mise à jour du Role', 'role'))
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      await response.json()
      return dispatch(fetchRole())
    } catch (e) {
      console.error(e)
      return dispatch(setError('La réponse ne contient pas de json', 'role'))
    }
  } else {
    return dispatch(
      setError(`Erreur [${response.status}] ${response.statusText}`, 'role')
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
      return dispatch(setResults(roleJson.objects[0], 'role'))
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

export const fetchRoles = (circleId = null) => async dispatch => {
  let response, rolesJson
  let params = ''
  if (circleId) {
    params = `?circle_id=${+circleId}`
  }
  try {
    response = await fetch(`/api/roles${params}`, {
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
      rolesJson = await response.json()
    } catch (e) {
      return dispatch(setError('La réponse ne contient pas de json', 'roles'))
    }
  } else {
    const jsonMessage = typeof roleJson === 'undefined' ? '' : rolesJson.message
    return dispatch(
      setError(
        `${response.status}: ${response.statusText} ${jsonMessage}`,
        'roles'
      )
    )
  }
  return dispatch(setResults(rolesJson.objects, 'roles'))
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

export const addFocus = data => async dispatch => {
  let response
  try {
    response = await fetch('api/role_focuses', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
  } catch (e) {
    return dispatch(setError('Erreur pendant la création du focus', 'role'))
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      await response.json()
      return dispatch(fetchRole())
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
