import { roleNameFromState } from '../utils'
import { setError, setResults } from './index'

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
      window.location = 'http://gibolt.l:1520/roles'
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

export const fetchRole = () => async (dispatch, getState) => {
  let response
  let roleJson = {}
  const state = getState()
  const role = roleNameFromState(state)
  try {
    response = await fetch(`/api/roles/${role.id}`, {
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
  // if (roleJson.objects.parent_circle_id) {
  //   try {
  //     response = await fetch(
  //       `/api/circles/${roleJson.objects.parent_circle_id}`,
  //       {
  //         method: 'GET',
  //         credentials: 'same-origin',
  //       }
  //     )
  //   } catch (e) {
  //     return dispatch(
  //       setError(
  //         'Erreur pendant la récupération des données du cercle parent',
  //         'circle'
  //       )
  //     )
  //   }
  //   if (response.status >= 200 && response.status < 300) {
  //     try {
  //       parentroleJson = await response.json()
  //       roleJson.objects.parent_circle_name =
  //         parentroleJson.objects[0].circle_name
  //     } catch (e) {
  //       return dispatch(
  //         setError(
  //           'La réponse (cercle parent) ne contient pas de json',
  //           'circle'
  //         )
  //       )
  //     }
  //   } else {
  //     const jsonMessage =
  //       typeof parentroleJson === 'undefined' ? '' : parentroleJson.message
  //     return dispatch(
  //       setError(
  //         `${response.status}: ${response.statusText} ${jsonMessage}`,
  //         'repository'
  //       )
  //     )
  //   }
  // }
  return dispatch(setResults(roleJson.objects, 'role'))
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
      window.location = 'http://gibolt.l:1520/circles'
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

export const updateRole = (roleId, data) => async dispatch => {
  let response
  // json
  try {
    response = await fetch(`/api/circles/${roleId}`, {
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
      // let json =
      await response.json()
      window.location = 'http://gibolt.l:1520/roles'
    } catch (e) {
      return dispatch(setError('La réponse ne contient pas de json'))
    }
  }
  return dispatch(
    setError(
      `${response.status}: ${response.statusText} `,
      // ${json.message}
      'roles'
    )
  )
}
