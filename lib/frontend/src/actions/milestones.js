import { format } from 'date-fns'

import { fetchResults, setError } from './index'
import { updateMeetingData } from './meetings'
import { querystringize } from '../utils'

export const milestoneOnEdition = milestoneId => ({
  type: 'MILESTONE_EDITION_STATUS_UPDATE',
  milestoneId,
})

export const updateMilestoneCircles = (
  milestoneId,
  selectedCircles
) => async dispatch => {
  let response
  try {
    response = await fetch(`api/milestone_circles/${milestoneId}`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(selectedCircles),
    })
  } catch (e) {
    return dispatch(setError('Erreur pendant la mise à jour ', 'timeline'))
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      await response.json()
      dispatch(fetchResults('timeline'))
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
      milestone.issues = json.objects
      return milestone
    } catch (e) {
      throw new Error('La réponse ne contient pas de json', 'issues')
    }
  } else {
    throw new Error(`Erreur [${response.status}] ${response.statusText}`)
  }
}

export const fetchCircleMilestonesAndIssues = (
  circle,
  meetingName
) => async dispatch => {
  let json, response, lastReportDate
  const promises = []
  const params = querystringize({
    circle_id: circle.circle_id,
    meeting_name: meetingName,
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
      dispatch(setError('La réponse ne contient pas de json', 'meeting'))
      return dispatch(setError('La réponse ne contient pas de json', 'issues'))
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
  for (let i = 0; i < circle.circle_milestones.length; i++) {
    let { circleMilestone } = circle.circle_milestones[i]
    circleMilestone = circle.circle_milestones[i]
    promises.push(getMilestoneAndIssues(circleMilestone, lastReportDate))
  }
  Promise.all(promises)
    .then(resp => {
      dispatch(updateMeetingData(resp, 'projects'))
    })
    .catch(error => {
      dispatch(setError(error, 'meeting'))
    })
}
