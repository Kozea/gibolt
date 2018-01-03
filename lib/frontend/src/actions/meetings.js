import { stringify } from 'query-string'

export const setMeetingParams = params => ({
  type: 'SET_MEETINGS_PARAMS',
  params,
})

export const updateReportsList = (event, history) => dispatch => {
  const params = {
    circle_id: event.target.form.circles.value,
    meeting_name: event.target.form.meetingType.value,
  }
  dispatch(setMeetingParams(params))

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
