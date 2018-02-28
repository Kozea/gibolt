import { format } from 'date-fns'

import { setError } from './index'
import { updateMeeting } from './meetings'
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
      milestone = json.objects[0]
      milestone.repo_name = circleMilestone.repo_name
    } catch (e) {
      throw new Error('La réponse ne contient pas de json')
    }
  } else {
    throw new Error(`Erreur [${response.status}] ${response.statusText}`)
  }
  params = {
    milestone: circleMilestone.milestone_number,
    state: 'closed',
  }
  if (lastReportDate) {
    params.since = `${format(new Date(lastReportDate), 'YYYY-MM-DDTHH:mm:ss')}Z`
  }
  params = querystringize(params)
  try {
    response = await fetch(
      `/api/repos/${circleMilestone.repo_name}/milestone_tickets?${params}`,
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
      milestone.issues = json.objects
      milestone.comment = ''
      return milestone
    } catch (e) {
      throw new Error('La réponse ne contient pas de json', 'issues')
    }
  } else {
    throw new Error(`Erreur [${response.status}] ${response.statusText}`)
  }
}

export const fetchCircleMilestonesAndIssues = circle => async (
  dispatch,
  getState
) => {
  if (circle.circle_milestones.length === 0) {
    return dispatch(updateMeeting([], 'projects'))
  }
  const state = getState()
  // eslint-disable-next-line prefer-destructuring
  const lastReportDate = state.meeting.lastReportDate
  const promises = []
  for (let i = 0; i < circle.circle_milestones.length; i++) {
    let { circleMilestone } = circle.circle_milestones[i]
    circleMilestone = circle.circle_milestones[i]
    promises.push(getMilestoneAndIssues(circleMilestone, lastReportDate))
  }
  await Promise.all(promises)
    .then(resp => dispatch(updateMeeting(resp, 'projects')))
    .catch(error => dispatch(setError(error, 'meeting')))
}
