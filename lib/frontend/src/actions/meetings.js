import { stringify } from 'query-string'

import { querystringize, reportIdFromState, sortUsers } from '../utils'
import { setError, setParams, setResults, unsetLoading } from './index'
import { fetchCircleMilestonesAndIssues } from './milestones'

export const expandMilestone = milestoneId => ({
  type: 'MILESTONE_EXPAND',
  milestoneId,
})

export const disableEdition = value => ({
  type: 'MEETING_ON_EDITION',
  value: value,
})

export const updateLastReportDate = value => ({
  type: 'UPDATE_LAST_REPORT',
  value: value,
})

export const updateMeeting = (data, dataType) => ({
  type: 'MEETING_UPDATE',
  data,
  dataType,
})

export const updateMeetingAttendees = (name, checked) => ({
  type: 'MEETING_UPDATE_ATTENDEES',
  name,
  checked,
})

export const updateMeetingActions = (content, checked) => ({
  type: 'MEETING_UPDATE_ACTIONS',
  content,
  checked,
})

export const updateMeetingIndicators = (content, value) => ({
  type: 'MEETING_UPDATE_INDICATORS',
  content,
  value,
})

export const updateMeetingProjects = (milestoneId, comment) => ({
  type: 'MEETING_UPDATE_PROJECTS',
  milestoneId,
  comment,
})

export const updateMeetingAgenda = (ticketId, meetingComment) => ({
  type: 'MEETING_UPDATE_AGENDA',
  ticketId,
  meetingComment,
})

export const updateMeetingContent = content => ({
  type: 'MEETING_UPDATE_CONTENT',
  content,
})

export const getUsersListFromRoles = (roles, users) => dispatch => {
  const newUserList = []
  let usersList = roles.map(
    role => users.filter(user => role.user_id === user.user_id)[0]
  )
  usersList = sortUsers(Array.from(new Set(usersList)))
  usersList.map(user => {
    newUserList.push({
      user_id: user.user_id,
      checked: true,
      user: {
        avatar_url: user.avatar_url,
        user_name: user.user_name,
      },
    })
  })
  return dispatch(updateMeeting(newUserList, 'attendees'))
}

export const sortAttendees = presents => {
  const presentsList = []
  for (let i = 0; i < presents.length; i++) {
    presentsList.push({
      user_name: presents[i].user.user_name,
      checked: presents[i].checked,
    })
  }
  presentsList.sort((a, c) => c.checked - a.checked)
  return presentsList
}

export const sortProjects = milestones => {
  milestones.sort(function(a, b) {
    return `${a.repo.toLowerCase()}-${a.number}` >
      `${b.repo.toLowerCase()}-${b.number}`
      ? 1
      : `${b.repo.toLowerCase()}-${b.number}` >
        `${a.repo.toLowerCase()}-${a.number}`
        ? -1
        : 0
  })
  return milestones
}

export const updateReportsList = (event, history = null) => dispatch => {
  const params = {
    circle_id: event.target.form.circles.value
      ? +event.target.form.circles.value
      : '',
    meeting_name: event.target.form.meetingType.value,
  }
  dispatch(setParams(params))
  if (history) {
    let search = {}
    if (event.target.form.circles.value !== '') {
      search.circle_id = event.target.form.circles.value
    }
    if (event.target.form.meetingType.value !== '') {
      search.meeting_name = event.target.form.meetingType.value
    }
    search = stringify(search)
    history.push(`/meetings?${search}`)
  }
}

const formatMeeting = meeting => {
  meeting.projects = meeting.projects.map(project => project.milestone)
  meeting.agenda = meeting.agenda.map(issue => issue.ticket)
  return meeting
}

export const fetchReport = (search = null) => async (dispatch, getState) => {
  let response
  let json = {}
  const state = getState()
  const report = search ? search : reportIdFromState(state)
  try {
    response = await fetch(`/api/reports/${report.report_id}`, {
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
      const meeting = formatMeeting(json.objects[0])
      dispatch(disableEdition(true))
      dispatch(setResults(meeting, 'meeting'))
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
}

export const submitOrUpdateReport = (history, isCreation) => async (
  dispatch,
  getState
) => {
  let response, json, method, url
  const state = getState()
  const newReport = state.meeting.results
  if (isCreation) {
    newReport.circle_id = state.params.circle_id
    newReport.report_type = state.params.meeting_name
    newReport.author_id = state.user.id
    method = 'POST'
    url = '/api/reports'
  } else {
    newReport.modified_by = state.user.id
    method = 'PUT'
    url = `/api/reports/${newReport.report_id}`
  }
  try {
    response = await fetch(url, {
      method,
      body: JSON.stringify(newReport),
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (e) {
    return dispatch(
      setError('Erreur pendant la création du rapport'),
      'meeting'
    )
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      json = await response.json()
    } catch (e) {
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
  if (isCreation) {
    return history.push(`/meeting?report_id=${json.objects[0].report_id}`)
  }
  const meeting = formatMeeting(json.objects[0])
  dispatch(disableEdition(true))
  dispatch(setResults(meeting, 'meeting'))
}

async function fetchRoleItems(role) {
  let response
  const actions = []
  const indicators = []
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
      for (let i = 0; i < json.objects.length; i++) {
        if (json.objects[i].item_type === 'checklist') {
          actions.push({
            item_id: json.objects[i].item_id,
            content: `${role.role_name} - ${json.objects[i].content}`,
          })
        } else {
          indicators.push({
            item_id: json.objects[i].item_id,
            content: `${role.role_name} - ${json.objects[i].content}`,
          })
        }
      }
      return { actions, indicators }
    } catch (e) {
      throw new Error('La réponse ne contient pas de json')
    }
  } else {
    throw new Error(`Erreur [${response.status}] ${response.statusText}`)
  }
}

export const fetchCircleItems = circle => dispatch => {
  const promises = []
  const actions = []
  const indicators = []
  for (let i = 0; i < circle.roles.length; i++) {
    let { role } = circle.roles[i]
    role = circle.roles[i]
    promises.push(fetchRoleItems(role))
  }
  Promise.all(promises)
    .then(responses => {
      responses.map(resp => {
        if (resp.actions[0]) {
          resp.actions[0].checked = false
          actions.push(resp.actions[0])
        }
        if (resp.indicators[0]) {
          resp.indicators[0].value = ''
          indicators.push(resp.indicators[0])
        }
      })
    })
    .then(() => {
      dispatch(updateMeeting(actions, 'actions'))
      dispatch(updateMeeting(indicators, 'indicators'))
    })
    .catch(error => {
      dispatch(setError(error, 'meeting'))
    })
}

export const fetchCircleAgendaIssues = (
  circleLabel,
  meetingName
) => async dispatch => {
  let response
  let ticketsJson = {}
  const params = `labels=${circleLabel}&labels=${meetingName}&search=&assignee=&involves=` // eslint-disable-line max-len
  try {
    response = await fetch(`/api/tickets?${params}`, {
      method: 'GET',
      credentials: 'same-origin',
    })
  } catch (e) {
    return dispatch(
      setError(
        'Erreur pendant la récupération des données des tickets',
        'issues'
      )
    )
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      ticketsJson = await response.json()
      for (let i = 0; i < ticketsJson.objects.length; i++) {
        ticketsJson.objects[i].meeting_comment = ''
      }
      dispatch(updateMeeting(ticketsJson.objects, 'agenda'))
    } catch (e) {
      return dispatch(setError('La réponse ne contient pas de json', 'issues'))
    }
  } else {
    const jsonMessage =
      typeof ticketsJson === 'undefined' ? '' : ticketsJson.message
    return dispatch(
      setError(
        `${response.status}: ${response.statusText} ${jsonMessage}`,
        'issues'
      )
    )
  }
}

export const getLastReport = params => async dispatch => {
  if (
    !params.circle_id ||
    params.circle_id === '' ||
    !params.meeting_name ||
    params.meeting_name === ''
  ) {
    return
  }
  let json, response
  const searchParams = querystringize({
    circle_id: params.circle_id,
    meeting_name: params.meeting_name,
    limit: 1,
  })
  try {
    response = await fetch(`/api/reports?${searchParams}`, {
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
      return dispatch(
        updateLastReportDate(
          json.objects[0] ? json.objects[0].created_at : null
        )
      )
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
}

export const fetchMeetingData = params => async (dispatch, getState) => {
  if (params.circle_id === '' || params.meeting_name === '') {
    return dispatch(
      setError('Circle AND meeting name must be selected.', 'meeting')
    )
  }
  const promises = []
  const state = getState()
  // eslint-disable-next-line prefer-destructuring
  const circle = state.circles.results.filter(
    c => c.circle_id === params.circle_id
  )[0]
  if (!circle) {
    return
  }
  if (circle.roles.length === 0) {
    return dispatch(
      setError('Circle roles must be defined defined.', 'meeting')
    )
  }
  const meetingType = params.meeting_name
  promises.push(dispatch(fetchCircleItems(circle)))
  promises.push(
    dispatch(getUsersListFromRoles(circle.roles, state.users.results))
  )
  promises.push(dispatch(updateMeeting('', 'content')))
  promises.push(dispatch(disableEdition(false)))
  if (meetingType === 'Triage') {
    promises.push(dispatch(fetchCircleMilestonesAndIssues(circle)))
  } else {
    promises.push(dispatch(updateMeeting([], 'projects')))
  }
  if (circle.label[0]) {
    promises.push(
      dispatch(fetchCircleAgendaIssues(circle.label[0].text, meetingType))
    )
  } else {
    promises.push(dispatch(updateMeeting([], 'agenda')))
  }
  await Promise.all(promises).then(() => dispatch(unsetLoading('meeting')))
}
