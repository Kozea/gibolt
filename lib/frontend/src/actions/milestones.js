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

export const removeCircleMilestone = circleMilestones => ({
  type: 'REMOVE_CIRCLE_MILESTONE',
  circleMilestones,
})

export const removeMeetingMilestone = projects => ({
  type: 'REMOVE_MEETING_MILESTONE',
  projects,
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

export const deleteMilestoneCircles = (
  circleId,
  milestoneNumber,
  repoName,
  target
) => async (dispatch, getState) => {
  let response
  try {
    response = await fetch(
      `api/milestone_circles/${circleId}/${milestoneNumber}/${repoName}`,
      {
        method: 'DELETE',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (e) {
    return dispatch(setError('Erreur pendant la mise à jour ', target))
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      await response.json()
    } catch (e) {
      return dispatch(setError('La réponse ne contient pas de json', target))
    }
  } else if (!(target === 'meeting' && response.status === 404)) {
    // to allow to suppress a milestone in a report even if the association to
    // the circle does not exist anymore
    return dispatch(
      setError(`Erreur [${response.status}] ${response.statusText}`, target)
    )
  }
  // NOTE: refactor the app with using same name for milestone number and repo
  const state = getState()
  const newMilestonesList = []
  if (target === 'circle') {
    state.circle.results.circle_milestones.map(mil => {
      if (
        mil.milestone_number !== milestoneNumber ||
        mil.repo_name !== repoName
      ) {
        newMilestonesList.push(mil)
      }
    })
    return dispatch(removeCircleMilestone(newMilestonesList))
  }
  // target === 'meeting'
  if (state.meeting.results.report_id) {
    try {
      response = await fetch(
        `api/report_milestones/${
          state.meeting.results.report_id
        }/${milestoneNumber}/${repoName}`,
        {
          method: 'DELETE',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    } catch (e) {
      return dispatch(
        setError(
          'Erreur lors de la suppression du projet rattaché au rapport',
          'meeting'
        )
      )
    }
    if (response.status >= 200 && response.status < 300) {
      try {
        await response.json()
      } catch (e) {
        return dispatch(
          setError('La réponse ne contient pas de json', 'meeting')
        )
      }
    } else {
      return dispatch(
        setError(
          `Erreur [${response.status}] ${response.statusText}`,
          'meeting'
        )
      )
    }
  }
  state.meeting.results.projects.map(mil => {
    if (mil.number !== milestoneNumber || mil.repo !== repoName) {
      newMilestonesList.push(mil)
    }
  })
  return dispatch(removeMeetingMilestone(newMilestonesList))
}

export async function getMilestoneAndIssues(
  circleMilestone,
  lastReportDate,
  getIssues = true
) {
  let json, params, response
  let milestone = []
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
  if (getIssues) {
    params = {
      milestone: circleMilestone.milestone_number,
      state: 'closed',
    }
    if (lastReportDate) {
      params.since = `${format(
        new Date(lastReportDate),
        'YYYY-MM-DDTHH:mm:ss'
      )}Z`
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
        milestone[0].issues = json.objects
        milestone[0].comment = ''
      } catch (e) {
        throw new Error('La réponse ne contient pas de json', 'issues')
      }
    } else {
      throw new Error(`Erreur [${response.status}] ${response.statusText}`)
    }
  }
  return milestone[0]
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
    promises.push(getMilestoneAndIssues(circleMilestone, lastReportDate, true))
  }
  await Promise.all(promises)
    .then(resp => dispatch(updateMeeting(resp, 'projects')))
    .catch(error => dispatch(setError(error, 'meeting')))
}

export const closeMilestone = (
  milestoneNumber,
  repoName,
  data
) => async dispatch => {
  let response, json
  try {
    response = await fetch(
      `api/repos/${repoName}/milestones/${milestoneNumber}`,
      {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    )
  } catch (e) {
    return dispatch(setError('Erreur pendant la mise à jour ', 'timeline'))
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      json = await response.json()
      return dispatch(updateMilestone(json.objects.id, json.objects))
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
