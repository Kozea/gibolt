import { addDays, differenceInDays } from 'date-fns'
import { stringify } from 'query-string'

import {
  daysBeforeExpiration,
  querystringize,
  reportIdFromState,
  sortUsers,
} from '../utils'
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

export const emptyMeeting = () => ({
  type: 'MEETING_EMPTY',
})

export const updateMeeting = (data, dataType) => ({
  type: 'MEETING_UPDATE',
  data,
  dataType,
})

export const partialUpdateMeeting = data => ({
  type: 'MEETING_PARTIAL_UPDATE',
  data,
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
    role =>
      role.role_focuses.map(
        focus =>
          focus.role_focus_users.length > 0 &&
          users.filter(
            user => focus.role_focus_users[0].user_id === user.user_id
          )[0]
      )[0]
  )
  usersList = sortUsers(Array.from(new Set(usersList)))
  usersList.map(user => {
    if (user) {
      newUserList.push({
        user_id: user.user_id,
        checked: true,
        user: {
          avatar_url: user.avatar_url,
          user_name: user.user_name,
        },
      })
    }
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
  presentsList.sort(
    (a, b) =>
      `${0 - a.checked}-${a.user_name.toLowerCase()}` >
      `${0 - b.checked}-${b.user_name.toLowerCase()}`
        ? 1
        : `${0 - b.checked}-${b.user_name.toLowerCase()}` >
          `${0 - a.checked}-${a.user_name.toLowerCase()}`
          ? -1
          : 0
  )
  return presentsList
}

export const sortProjects = milestones => {
  milestones.sort(function(a, b) {
    return `${a.repo.toLowerCase()}-${a.due_on}` >
      `${b.repo.toLowerCase()}-${b.due_on}`
      ? 1
      : `${b.repo.toLowerCase()}-${b.due_on}` >
        `${a.repo.toLowerCase()}-${a.due_on}`
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
      dispatch(
        getLastReports(
          {
            circle_id: meeting.circle_id,
            meeting_name: meeting.report_type,
          },
          false,
          report.report_id
        )
      )
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

export const submitOrUpdateReport = (
  isCreation, // is function called from report creation page
  editionDisabled,
  history = null,
  isSubmitted = null
) => async (dispatch, getState) => {
  let response, json, method, url
  const state = getState()
  const newReport = state.meeting.results
  for (let i = 0; i < newReport.indicators.length; i++) {
    newReport.indicators[i].value =
      newReport.indicators[i].value === ''
        ? null
        : parseFloat(newReport.indicators[i].value)
  }
  if (newReport.report_id) {
    // edition
    newReport.modified_by = state.user.id
    method = 'PUT'
    url = `/api/reports/${newReport.report_id}`
  } else {
    // creation
    newReport.circle_id = state.params.circle_id
    newReport.report_type = state.params.meeting_name
    newReport.author_id = state.user.id
    method = 'POST'
    url = '/api/reports'
  }
  if (isSubmitted) {
    newReport.is_submitted = true
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
  if (isCreation && editionDisabled && history) {
    return history.push(`/meeting?report_id=${json.objects[0].report_id}`)
  }
  const meeting = formatMeeting(json.objects[0])
  dispatch(disableEdition(editionDisabled))
  dispatch(partialUpdateMeeting(meeting))
}

export const formatCircleItems = circle => dispatch => {
  const actions = []
  const indicators = []
  for (let i = 0; i < circle.roles.length; i++) {
    let { role } = circle.roles[i]
    role = circle.roles[i]
    role.role_focuses.map(focus =>
      focus.items.map(
        item =>
          item.item_type === 'checklist'
            ? actions.push({
                item_id: item.item_id,
                content: `${role.role_name}${focus.focus_name !== '' &&
                  ` - ${focus.focus_name}`} - ${item.content}`,
              })
            : indicators.push({
                item_id: item.item_id,
                content: `${role.role_name}${focus.focus_name !== '' &&
                  ` - ${focus.focus_name}`} - ${item.content}`,
              })
      )
    )
  }
  dispatch(updateMeeting(actions, 'actions'))
  dispatch(updateMeeting(indicators, 'indicators'))
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

const filterLastReports = reports => {
  const meetingsList = []
  if (reports.length > 1) {
    for (let i = 1; i < reports.length; i++) {
      meetingsList.push(reports[i])
    }
  }
  return meetingsList
}

export const getLastReports = (
  params,
  isCreation,
  reportId = null
) => async dispatch => {
  if (
    !params.circle_id ||
    params.circle_id === '' ||
    !params.meeting_name ||
    params.meeting_name === ''
  ) {
    return
  }
  let json, response
  let searchParams = {
    circle_id: params.circle_id,
    meeting_name: params.meeting_name,
    limit: 9,
  }
  if (!isCreation) {
    searchParams.from_id = reportId
  }
  searchParams = querystringize(searchParams)
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
      if (isCreation) {
        dispatch(setResults(json.objects, 'meetings'))
      } else {
        const meetingsList = filterLastReports(json.objects)
        dispatch(setResults(meetingsList, 'meetings'))
      }
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

export const getExpiredRoles = (circle, meetingType) => dispatch => {
  const expiredRoles = []
  const daysBeforeRoleExpiration =
    meetingType === 'Gouvernance' ? 0 : daysBeforeExpiration
  const roleType = meetingType === 'Gouvernance' ? 'elected' : 'assigned'
  let distance, endDate, roleFocus
  circle.roles.filter(role => role.role_type === roleType).map(role =>
    role.role_focuses.map(focus => {
      endDate = focus.role_focus_users[0].end_date
        ? focus.role_focus_users[0].end_date
        : role.duration && focus.role_focus_users[0].start_date
          ? addDays(
              new Date(focus.role_focus_users[0].start_date),
              role.duration
            )
          : null
      if (endDate) {
        distance = differenceInDays(new Date(endDate), new Date())
        if (distance < daysBeforeRoleExpiration) {
          roleFocus = focus
          roleFocus.duration = role.duration
          roleFocus.role_id = role.role_id
          roleFocus.role_name = role.role_name
          expiredRoles.push(roleFocus)
        }
      }
    })
  )
  return dispatch(updateMeeting(expiredRoles, 'expiredRoles'))
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
  const circle = state.circle.results
  if (!circle.circle_id) {
    return
  }
  const meetingType = params.meeting_name
  if (circle.roles.length === 0) {
    return dispatch(
      setError('Circle roles must be defined defined.', 'meeting')
    )
  }
  promises.push(dispatch(updateMeeting(false, 'is_submitted')))
  promises.push(
    dispatch(getUsersListFromRoles(circle.roles, state.users.results))
  )
  promises.push(dispatch(updateMeeting('', 'content')))
  if (meetingType === 'Gouvernance' || meetingType === 'Triage') {
    promises.push(dispatch(getExpiredRoles(circle, meetingType)))
  } else {
    dispatch(updateMeeting([], 'expiredRoles'))
  }
  if (meetingType === 'Triage') {
    promises.push(dispatch(formatCircleItems(circle)))
    promises.push(dispatch(fetchCircleMilestonesAndIssues(circle)))
  } else {
    promises.push(dispatch(updateMeeting([], 'actions')))
    promises.push(dispatch(updateMeeting([], 'indicators')))
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
