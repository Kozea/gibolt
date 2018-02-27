import { format } from 'date-fns'

import { setError, setResults } from './index'
import { querystringize } from '../utils'

export const milestoneOnEdition = milestoneId => ({
  type: 'MILESTONE_EDITION_STATUS_UPDATE',
  milestoneId,
})

export const expandMilestone = milestoneId => ({
  type: 'MILESTONE_EXPAND',
  milestoneId,
})

export const updateMilestone = (milestoneId, newMilestone) => ({
  type: 'MILESTONE_UPDATE',
  milestoneId,
  newMilestone,
})

export const getOptionsCircleLabels = (milestoneCircles, circles, labels) => {
  const options = []
  const milestoneCirclesValues = []
  circles.map(circle => {
    labels.filter(label => label.label_id === circle.label_id).map(label => {
      options.push({
        color: label.color,
        label: label.text,
        type: circle.circle_id, // to allow multiple in timeline page
        value: circle.circle_id,
        disabled: false,
      })
      if (milestoneCircles.find(x => x.circle_id === circle.circle_id)) {
        milestoneCirclesValues.push({
          color: label.color,
          label: label.text,
          type: circle.circle_id,
          value: circle.circle_id,
        })
      }
    })
  })
  return { options, milestoneCirclesValues }
}

export const getSelectedCircles = circleSelect => {
  const selectedCircles = []
  if (circleSelect) {
    if (circleSelect.length > 0) {
      for (let i = 0; i < circleSelect.length; i++) {
        selectedCircles.push({ circle_id: +circleSelect[i].value })
      }
    } else {
      selectedCircles.push({ circle_id: +circleSelect.value })
    }
  }
  return selectedCircles
}

export const updateMilestoneCircles = (
  milestoneNumber,
  repoName,
  selectedCircles
) => async dispatch => {
  let response, json
  try {
    response = await fetch(
      `api/milestone_circles/${repoName}/${milestoneNumber}`,
      {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedCircles),
      }
    )
  } catch (e) {
    return dispatch(setError('Erreur pendant la mise à jour ', 'timeline'))
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      json = await response.json()
      return dispatch(updateMilestone(json.objects[0].id, json.objects[0]))
    } catch (e) {
      return dispatch(
        setError('La réponse ne contient pas de json', 'timeline')
      )
    }
  } else {
    return dispatch(
      setError(`Erreur [${response.status}] ${response.statusText}`, 'timeline')
    )
  }
}

async function getMilestoneAndIssues(circleMilestone, lastReportDate) {
  let json, params, response, milestone
  let issues = []
  try {
    response = await fetch(
      `/api/repos/${circleMilestone.repo_name}/milestones/${
        circleMilestone.milestone_number
      }`,
      {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (e) {
    throw new Error('Erreur pendant la mise à jour')
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      json = await response.json()
      milestone = json.objects
    } catch (e) {
      throw new Error('La réponse ne contient pas de json')
    }
  } else {
    throw new Error(`Erreur [${response.status}] ${response.statusText}`)
  }
  params = {
    milestone: milestone.milestone_number,
    state: 'closed',
  }
  if (lastReportDate) {
    params.since = `${format(new Date(lastReportDate), 'YYYY-MM-DDTHH:mm:ss')}Z`
  }
  params = querystringize(params)
  try {
    response = await fetch(
      `/api/repos/${milestone.repo_name}/milestone_tickets?${params}`,
      {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (e) {
    console.error(e)
    throw new Error('Erreur pendant la mise à jour ')
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      json = await response.json()
      issues = json.objects
    } catch (e) {
      throw new Error('La réponse ne contient pas de json', 'issues')
    }
  } else {
    throw new Error(`Erreur [${response.status}] ${response.statusText}`)
  }
  return { milestone, issues }
}

export const fetchCircleMilestonesAndIssues = circleId => async (
  dispatch,
  getState
) => {
  let json, response, lastReportDate
  const milestones = []
  const allIssues = []
  const promises = []
  const state = getState()
  const circle = state.circles.results.filter(c => c.circle_id === circleId)

  if (circle.length > 0) {
    const params = querystringize({
      circle_id: circleId,
      meeting_name: state.params.meeting_name,
      limit: 1,
    })
    try {
      response = await fetch(`/api/reports?${params}`, {
        method: 'GET',
        credentials: 'same-origin',
      })
    } catch (e) {
      return dispatch(
        setError('Erreur pendant la récupération du rapport'),
        'meeting'
      )
    }
    if (response.status >= 200 && response.status < 300) {
      try {
        json = await response.json()
        lastReportDate = json.objects[0] ? json.objects[0].created_at : null
      } catch (e) {
        console.error(e)
        dispatch(
          setError('La réponse ne contient pas de json', 'circleMilestones')
        )
        return dispatch(
          setError('La réponse ne contient pas de json', 'issues')
        )
      }
    } else {
      const jsonMessage = typeof json === 'undefined' ? '' : json.message
      return dispatch(
        setError(
          `${response.status}: ${response.statusText} ${jsonMessage}`,
          'meeting'
        )
      )
    }

    for (let i = 0; i < circle[0].circle_milestones.length; i++) {
      let { circleMilestone } = circle[0].circle_milestones[i]
      circleMilestone = circle[0].circle_milestones[i]
      promises.push(getMilestoneAndIssues(circleMilestone, lastReportDate))
    }
    Promise.all(promises)
      .then(reponses => {
        reponses.map(resp => {
          milestones.push(resp.milestone)
          resp.issues.map(iss => allIssues.push(iss))
        })
      })
      .then(() => {
        const lastState = getState()
        dispatch(setResults(milestones, 'circleMilestones'))
        dispatch(
          setResults(
            {
              ['issues']: allIssues,
              ['agenda']: lastState.issues.results.agenda,
            },
            'issues'
          )
        )
      })
      .catch(error => {
        dispatch(setError(error, 'circleMilestones'))
        dispatch(setError(error, 'issues'))
      })
  }
}

async function fetchRoleItems(role) {
  let response
  const items = []
  try {
    response = await fetch(`/api/items?role_id=${role.role_id}`, {
      method: 'GET',
      credentials: 'same-origin',
    })
  } catch (e) {
    console.error(e)
    throw new Error('Erreur pendant la mise à jour')
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      const json = await response.json()
      items.push({
        role_name: role.role_name,
        items: json.objects,
      })
      return items
    } catch (e) {
      throw new Error('La réponse ne contient pas de json')
    }
  } else {
    throw new Error(`Erreur [${response.status}] ${response.statusText}`)
  }
}

export const fetchCircleItems = circleId => (dispatch, getState) => {
  const items = []
  const promises = []
  const state = getState()
  const circle = state.circles.results.filter(c => c.circle_id === circleId)

  if (circle.length > 0) {
    for (let i = 0; i < circle[0].roles.length; i++) {
      let { role } = circle[0].roles[i]
      role = circle[0].roles[i]
      promises.push(fetchRoleItems(role))
    }
  }
  Promise.all(promises)
    .then(reponses => {
      reponses.map(resp => {
        items.push(resp[0])
      })
    })
    .then(() => {
      dispatch(setResults(items, 'items'))
    })
    .catch(error => {
      dispatch(setError(error, 'items'))
    })
}
