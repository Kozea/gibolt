import { stringify } from 'query-string'

import { reportIdFromState } from '../utils'
import { updateMarkdown, setError, setParams, setResults } from './index'

export const toggleEdition = () => ({
  type: 'MEETING_ON_EDITION',
})

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

export const fetchCircleAgendaIssues = (circleLabel, meetingName) => async (
  dispatch,
  getState
) => {
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
      const state = getState()
      dispatch(
        setResults(
          {
            ['issues']: state.issues.results.issues,
            ['agenda']: ticketsJson.objects,
          },
          'issues'
        )
      )
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
