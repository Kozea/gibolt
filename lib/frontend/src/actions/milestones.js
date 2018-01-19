import { format } from 'date-fns'

import { fetchResults, setError, setResults } from './index'
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

const getLastClosedIssues = (
  milestones,
  circleId,
  meetingName
) => async dispatch => {
  let issues = []
  let lastReport = {}
  let response, json
  let params = querystringize({
    circle_id: circleId,
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
      lastReport = await response.json()
    } catch (e) {
      console.error(e)
      return dispatch(setError('La réponse ne contient pas de json', 'meeting'))
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

  for (let i = 0; i < milestones.length; i++) {
    params = {
      milestone: milestones[i].milestone_number,
      state: 'closed',
    }
    if (lastReport.objects.length > 0) {
      params.since = `${format(
        new Date(lastReport.objects[0].created_at),
        'YYYY-MM-DDTHH:MM:SS'
      )}Z`
    }
    params = querystringize(params)
    try {
      response = await fetch(
        `/api/repos/${milestones[i].repo_name}/milestone_tickets?${params}`,
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
      dispatch(setError('Erreur pendant la mise à jour ', 'circleMilestones'))
    }
    if (response.status >= 200 && response.status < 300) {
      try {
        json = await response.json()
        issues = issues.concat(json.objects)
      } catch (e) {
        return dispatch(
          setError('La réponse ne contient pas de json', 'circleMilestones')
        )
      }
    } else {
      return dispatch(
        setError(
          `Erreur [${response.status}] ${response.statusText}`,
          'circleMilestones'
        )
      )
    }
  }
  dispatch(setResults({ ['issues']: issues }, 'issues'))
}

export const fetchCircleMilestonesAndItems = () => async (
  dispatch,
  getState
) => {
  let response
  const milestones = []
  const items = []
  const state = getState()
  const circle = state.circles.results.filter(
    c => c.circle_id === state.params.circle_id
  )

  if (circle.length > 0) {
    for (let i = 0; i < circle[0].circle_milestones.length; i++) {
      let { circleMilestones } = circle[0].circle_milestones[i]
      circleMilestones = circle[0].circle_milestones[i]
      try {
        response = await fetch(
          `/api/repos/${circleMilestones.repo_name}/milestones/${
            circleMilestones.milestone_number
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
        return dispatch(
          setError('Erreur pendant la mise à jour ', 'circleMilestones')
        )
      }
      if (response.status >= 200 && response.status < 300) {
        try {
          const json = await response.json()
          milestones.push(json.objects)
        } catch (e) {
          return dispatch(
            setError('La réponse ne contient pas de json', 'circleMilestones')
          )
        }
      } else {
        return dispatch(
          setError(
            `Erreur [${response.status}] ${response.statusText}`,
            'circleMilestones'
          )
        )
      }
    }
    dispatch(setResults(milestones, 'circleMilestones'))

    dispatch(
      getLastClosedIssues(
        milestones,
        circle[0].circle_id,
        state.params.meeting_name
      )
    )

    for (let i = 0; i < circle[0].roles.length; i++) {
      let { role } = circle[0].roles[i]
      role = circle[0].roles[i]
      try {
        response = await fetch(`/api/items?role_id=${role.role_id}`, {
          method: 'GET',
          credentials: 'same-origin',
        })
      } catch (e) {
        return dispatch(setError('Erreur pendant la mise à jour ', 'items'))
      }
      if (response.status >= 200 && response.status < 300) {
        try {
          const json = await response.json()
          items.push({
            role_name: role.role_name,
            items: json.objects,
          })
        } catch (e) {
          return dispatch(
            setError('La réponse ne contient pas de json', 'items')
          )
        }
      } else {
        return dispatch(
          setError(
            `Erreur [${response.status}] ${response.statusText}`,
            'items'
          )
        )
      }
    }
  }
  dispatch(setResults(items, 'items'))
}
