import { circleNameFromState } from '../utils'
import { fetchResults, setError, setLoading, setResults } from './index'
import { getMilestoneAndIssues } from './milestones'

export const editCircle = () => ({
  type: 'EDIT_CIRCLE',
})

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

export const createCircle = (data, history) => async dispatch => {
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
      const circleJson = await response.json()
      history.push(`/circle?circle_id=${circleJson.objects[0].circle_id}`)
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

async function getCircle(url) {
  let response, circleJson
  try {
    response = await fetch(url, {
      method: 'GET',
      credentials: 'same-origin',
    })
  } catch (e) {
    throw new Error('Erreur pendant la récupération des données du cercle.')
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      circleJson = await response.json()
      return circleJson.objects[0]
    } catch (e) {
      throw new Error('getCircle - La réponse ne contient pas de json')
    }
  } else {
    const jsonMessage =
      typeof circleJson === 'undefined' ? '' : circleJson.message
    throw new Error(
      `getCircle ${response.status}: ${response.statusText} ${jsonMessage}`
    )
  }
}

async function getCircleParent(parentCircleId) {
  if (parentCircleId) {
    let response, parentCircleJson
    try {
      response = await fetch(`/api/circles/${parentCircleId}`, {
        method: 'GET',
        credentials: 'same-origin',
      })
    } catch (e) {
      throw new Error(
        'Erreur pendant la récupération des données du cercle parent'
      )
    }
    if (response.status >= 200 && response.status < 300) {
      try {
        parentCircleJson = await response.json()
        return parentCircleJson.objects[0]
      } catch (e) {
        throw new Error(
          'getCircleParent - La réponse (cercle parent) ne contient pas de json'
        )
      }
    } else {
      const jsonMessage =
        typeof parentCircleJson === 'undefined' ? '' : parentCircleJson.message
      throw new Error(
        `getCircleParent ${response.status}: ${
          response.statusText
        } ${jsonMessage}`
      )
    }
  } else {
    return []
  }
}

async function getCircleChildren(param) {
  let response, childrenCircleJson
  try {
    response = await fetch(`/api/circles?parent_circle_id=${param}`, {
      method: 'GET',
      credentials: 'same-origin',
    })
  } catch (e) {
    throw new Error('Erreur pendant la récupération des sous-cercles du cercle')
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      childrenCircleJson = await response.json()
      return { children_circles: childrenCircleJson.objects }
    } catch (e) {
      throw new Error(
        'getCircleChildren - La réponse (sous-cercles) ne contient pas de json'
      )
    }
  } else {
    const jsonMessage =
      typeof childrenCircleJson === 'undefined'
        ? ''
        : childrenCircleJson.message
    throw new Error(
      `getCircleChildren ${response.status}: ${
        response.statusText
      } ${jsonMessage}`
    )
  }
}

async function getCircleNbReports(param) {
  let response, reportsJson
  try {
    response = await fetch(`/api/reports?circle_id=${param}`, {
      method: 'GET',
      credentials: 'same-origin',
    })
  } catch (e) {
    throw new Error(
      'Erreur pendant la récupération du nombre de rapport du cercle'
    )
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      reportsJson = await response.json()
      return { nb_reports: reportsJson.occurences }
    } catch (e) {
      throw new Error(
        // eslint-disable-next-line max-len
        'getCircleNbReports - La réponse (nb de rapports) ne contient pas de json'
      )
    }
  } else {
    const jsonMessage =
      typeof reportsJson === 'undefined' ? '' : reportsJson.message

    throw new Error(
      `getCircleNbReports ${response.status}: ${
        response.statusText
      } ${jsonMessage}`
    )
  }
}

async function getCircleMilestones(circle) {
  if (circle.circle_milestones.length > 0) {
    for (let i = 0; i < circle.circle_milestones.length; i++) {
      const milestone = await getMilestoneAndIssues(
        circle.circle_milestones[i],
        null,
        false
      )
      circle.circle_milestones[i].milestone = milestone
    }
  }
  return circle
}

export const getUserInfos = (circleRoleFocus, users) => {
  let currentUser
  if (circleRoleFocus.role_focus_users[0]) {
    // only one active user per focus
    currentUser = users.filter(
      user => user.user_id === circleRoleFocus.role_focus_users[0].user_id
    )
    if (currentUser[0]) {
      circleRoleFocus.role_focus_users[0].user_name = currentUser[0].user_name
      circleRoleFocus.role_focus_users[0].avatar_url = currentUser[0].avatar_url
    } else {
      circleRoleFocus.role_focus_users[0].user_name = null
      circleRoleFocus.role_focus_users[0].avatar_url = null
    }
  }
  return circleRoleFocus
}

export const getAllUsersInfos = (circleRoles, users) => {
  if (circleRoles.length > 0) {
    for (let i = 0; i < circleRoles.length; i++) {
      if (circleRoles[i].role_focuses.length > 0) {
        for (let j = 0; j < circleRoles[i].role_focuses.length; j++) {
          circleRoles[i].role_focuses[j] = getUserInfos(
            circleRoles[i].role_focuses[j],
            users
          )
        }
      }
    }
  }
  return circleRoles
}

export const fetchCircle = (param = null, onlyCircle = false) => async (
  dispatch,
  getState
) => {
  let url, circle
  let promises = [],
    users = []
  const state = getState()
  if (param === null) {
    // called from Circle or Create Role pages
    circle = circleNameFromState(state)
    param = +circle.circle_id
    if (isNaN(param)) {
      return dispatch(
        setError('circle_id is missing or is not a number', 'circle')
      )
    }
    url = `/api/circles/${param}`
  } else {
    // called from Issue detail page
    if (param === '') {
      return dispatch(setResults({}, 'circle'))
    }
    // param = circle's label_id
    url = `/api/circles${param}`
  }

  promises.push(getCircle(url))
  if (state.users.results.length === 0) {
    promises.push(dispatch(setLoading('users')))
    promises.push(dispatch(fetchResults('users')))
  }
  await Promise.all(promises)
    .then(res => {
      // eslint-disable-next-line prefer-destructuring
      circle = res[0]
      users = res[2] ? res[2].results : state.users.results
      if (onlyCircle) {
        // from Issue detail or Create Role pages
        dispatch(setResults(circle, 'circle'))
        return circle
      }
      promises = []
      promises.push(getCircleMilestones(circle))
      promises.push(getCircleParent(circle.parent_circle_id))
      promises.push(getCircleChildren(param))
      promises.push(getCircleNbReports(param))
      promises.push(getAllUsersInfos(circle.roles, users))
      Promise.all(promises)
        .then(result => {
          // eslint-disable-next-line prefer-destructuring
          circle = result[0]
          circle.parent_circle_name = result[1].circle_name
          circle.parent_circle_is_active = result[1].is_active
          circle.children_circles = result[2].children_circles
          circle.nb_reports = result[3].nb_reports
          dispatch(setResults(circle, 'circle'))
          return circle
        })
        .catch(err => {
          dispatch(setError(err.message, 'circle'))
          console.error(err)
        })
    })
    .catch(err => {
      dispatch(setError(err.message, 'circle'))
      console.error(err)
    })
}

export const deleteCircle = (data, history) => async dispatch => {
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
      history.push('/circles')
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
