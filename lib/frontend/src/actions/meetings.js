import { stringify } from 'query-string'

import { reportIdFromState } from '../utils'
import { updateMarkdown, setError, setParams, setResults } from './index'
import { fetchCircleMilestonesAndIssues } from './milestones'

export const expandMilestone = milestoneId => ({
  type: 'MILESTONE_EXPAND',
  milestoneId,
})

export const toggleEdition = () => ({
  type: 'MEETING_ON_EDITION',
})

export const updateMeetingData = (data, dataType) => ({
  type: 'MEETING_UPDATE',
  data,
  dataType,
})

export const getUsersListFromRoles = (roles, users) => {
  const usersList = roles.map(
    role => users.filter(user => role.user_id === user.user_id)[0]
  )
  if (usersList.length > 0) {
    return Array.from(new Set(usersList))
  }
  return []
}

export const updateReportsList = (event, history = null) => dispatch => {
  const params = {
    circle_id: +event.target.form.circles.value,
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

const sortPresents = presents => {
  const presentsList = []
  for (let i = 0; i < presents.length; i++) {
    presentsList.push({ name: presents[i].name, checked: presents[i].checked })
  }
  presentsList.sort((a, b) => b.checked - a.checked)
  return presentsList
}

export const submitReport = (event, meetingType, history) => async (
  dispatch,
  getState
) => {
  event.persist()

  let response
  let json = {}
  const state = getState()
  let indicators = ''
  let actions = ''
  let milestones = ''
  let issues = ''
  let users = ''
  let fullcontent = ''

  for (let i = 0; i < event.target.form.length; i++) {
    switch (event.target.form[i].id) {
      case 'indicateurs':
        indicators += `
* ${event.target.form[i].name} : ${
          event.target.form[i].value === '' ? 0 : event.target.form[i].value
        }
         `
        break
      case 'actions':
        actions += `
* [${event.target.form[i].checked ? 'x' : ' '}] ${event.target.form[i].name}
        `
        break
      case 'milestones':
        milestones += `
* ${event.target.form[i].name}${
          event.target.form[i].value === ''
            ? ''
            : `: ${event.target.form[i].value}`
        }
        `
        break
      case 'agenda':
        issues += `
  * ${event.target.form[i].name}${
          event.target.form[i].value === ''
            ? ''
            : `: ${event.target.form[i].value}`
        }
          `
        break
    }
  }

  const sortedUsers = sortPresents(event.target.form.users)
  for (let i = 0; i < sortedUsers.length; i++) {
    users += `
* [${sortedUsers[i].checked ? 'x' : ' '}] ${sortedUsers[i].name}
    `
  }

  fullcontent = `

### Presents:

${users}

`

  if (meetingType === 'Triage') {
    fullcontent += `

  ### Recurrent Actions:

  ${actions}

  ### Indicators:

  ${indicators}

  ### Milestones:

  ${milestones}

`
  }

  fullcontent += `

  ### Ordre du jour:

  #### Tickets

  ${issues}

  #### Autres

  ${event.target.form.body.value}

  `

  const newReport = {
    circle_id: +event.target.form.circles.value,
    report_type: event.target.form.meetingType.value,
    author_id: state.user.id,
    content: fullcontent,
  }
  try {
    response = await fetch('/api/reports', {
      method: 'POST',
      body: JSON.stringify(newReport),
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (e) {
    return dispatch(
      setError('Erreur pendant la création du rapport'),
      'meetings'
    )
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      json = await response.json()
      return history.push(`/meeting?report_id=${json.objects[0].report_id}`)
    } catch (e) {
      return dispatch(
        setError('La réponse ne contient pas de json', 'meetings')
      )
    }
  } else {
    const jsonMessage = typeof json === 'undefined' ? '' : json.message
    return dispatch(
      setError(
        `${response.status}: ${response.statusText} ${jsonMessage}`,
        'meetings'
      )
    )
  }
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
      dispatch(setResults(json.objects[0], 'meeting'))
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

export const updateReport = (reportId, content) => async (
  dispatch,
  getState
) => {
  let response, json
  const state = getState()
  const newReport = {
    modified_by: state.user.id,
    content: content,
  }
  try {
    response = await fetch(`/api/reports/${reportId}`, {
      method: 'PATCH',
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
      await response.json()
      dispatch(fetchReport())
      dispatch(updateMarkdown(''))
      return dispatch(toggleEdition())
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
            id: json.objects[i].item_id,
            content: `${role.role_name} - ${json.objects[i].content}`,
          })
        } else {
          indicators.push({
            id: json.objects[i].item_id,
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
          actions.push(resp.actions[0])
        }
        if (resp.indicators[0]) {
          indicators.push(resp.indicators[0])
        }
      })
    })
    .then(() => {
      dispatch(updateMeetingData(actions, 'actions'))
      dispatch(updateMeetingData(indicators, 'indicators'))
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
      dispatch(updateMeetingData(ticketsJson.objects, 'agenda'))
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

export const fetchMeetingData = params => (dispatch, getState) => {
  const state = getState()
  // eslint-disable-next-line prefer-destructuring
  const circle = state.circles.results.filter(
    c => c.circle_id === params.circle_id
  )[0]
  if (!circle) {
    return
  }
  const meetingType = params.meeting_name
  dispatch(fetchCircleItems(circle))
  if (meetingType === 'Triage') {
    dispatch(fetchCircleMilestonesAndIssues(circle, meetingType))
  }
  if (circle.label[0]) {
    dispatch(fetchCircleAgendaIssues(circle.label[0].text, meetingType))
  }
}
