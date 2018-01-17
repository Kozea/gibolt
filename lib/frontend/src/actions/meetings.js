import { stringify } from 'query-string'
// import { convertToRaw } from 'draft-js'
// import { stateFromHTML } from 'draft-js-import-html'
// import draftToMarkdown from 'draftjs-to-markdown'

import { reportIdFromState } from '../utils'
import { setError, setParams, setResults } from './index'

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

export const submitReport = (event, history) => async (dispatch, getState) => {
  event.persist()
  let response
  // const indic = event.target.form.childNodes[3].childNodes
  // const indicateurs = [
  //   `### ${
  //     event.target.form.childNodes[3].childNodes[1].childNodes[0].innerHTML
  //   }`,
  // ]
  let json = {}
  const state = getState()
  // for (let i = 0; i < indic.length; i++) {
  //   indicateurs = draftToMarkdown(
  //     convertToRaw(
  //       stateFromHTML(
  //         indicateurs +
  //           (event.target.form.childNodes[3].childNodes[1].childNodes[i + 1]
  //             .childNodes[0].innerHTML +
  //             ':' +
  //             event.target.form.indicData[i].value)
  //       )
  //     )
  //   )
  // }
  // const newReport = {
  //   circle_id: +event.target.form.circles.value,
  //   report_type: event.target.form.meetingType.value,
  //   author_id: state.user.id,
  //   content:
  //     draftToMarkdown(
  //       convertToRaw(
  //         stateFromHTML(
  //          event.target.form.childNodes[3].childNodes[0].innerHTML)
  //       )
  //     ) +
  //     draftToMarkdown(convertToRaw(stateFromHTML('<br />'))) +
  //     indicateurs +
  //     draftToMarkdown(convertToRaw(stateFromHTML('<br />'))) +
  //     event.target.form.body.value,
  // }
  const newReport = {
    circle_id: +event.target.form.circles.value,
    report_type: event.target.form.meetingType.value,
    author_id: state.user.id,
    content: event.target.form.body.value,
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
      return history.push(`/circle?circle_id=${newReport.circle_id}`)
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

export const fetchReport = () => async (dispatch, getState) => {
  let response
  let json = {}
  const state = getState()
  const report = reportIdFromState(state)
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
