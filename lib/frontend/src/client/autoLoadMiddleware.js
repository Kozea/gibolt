import { parse } from 'query-string'
import { LOCATION_CHANGE } from 'react-router-redux'

import { fetchRepository, fetchResults, setLoading } from '../actions'
import { fetchCircle } from '../actions/circle'
import { fetchIssues } from '../actions/issues'
import { fetchRepositoryWithoutLabels, setParams } from '../actions/issueForm'
import { setMeetingParams } from '../actions/meetings'

export default ({ getState, dispatch }) => next => action => {
  const state = getState()
  const rv = next(action)

  if (action.type === LOCATION_CHANGE) {
    const newState = getState()
    const query = state.router.location
      ? parse(state.router.location.search)
      : {}
    const newQuery = parse(newState.router.location.search)
    if (action.payload.pathname === '/') {
      if (
        state.issues.mustLoad ||
        query.priority !== newQuery.priority ||
        query.ack !== newQuery.ack ||
        query.qualifier !== newQuery.qualifier ||
        query.involves !== newQuery.involves ||
        query.assignee !== newQuery.assignee
      ) {
        dispatch(setLoading('issues'))
        dispatch(fetchIssues())
      }
    } else if (action.payload.pathname === '/timeline') {
      if (
        state.timeline.mustLoad ||
        query.start !== newQuery.start ||
        query.stop !== newQuery.stop
      ) {
        dispatch(setLoading('timeline'))
        dispatch(fetchResults('timeline'))
      }
    } else if (action.payload.pathname === '/report') {
      if (
        state.report.mustLoad ||
        query.start !== newQuery.start ||
        query.stop !== newQuery.stop
      ) {
        dispatch(setLoading('report'))
        dispatch(fetchResults('report'))
      }
    } else if (action.payload.pathname === '/repositories') {
      if (state.repositories.mustLoad) {
        dispatch(setLoading('repositories'))
        dispatch(fetchResults('repositories'))
      }
    } else if (action.payload.pathname === '/repository') {
      if (state.labels.mustLoad) {
        dispatch(setLoading('labels'))
        dispatch(fetchResults('labels'))
      }
      dispatch(setLoading('repository'))
      dispatch(fetchRepository())
    } else if (action.payload.pathname === '/circles') {
      if (state.labels.mustLoad) {
        dispatch(setLoading('labels'))
        dispatch(fetchResults('labels'))
      }
      dispatch(setLoading('circles'))
      dispatch(fetchResults('circles'))
    } else if (action.payload.pathname === '/circle') {
      if (state.labels.mustLoad) {
        dispatch(setLoading('labels'))
        dispatch(fetchResults('labels'))
      }
      if (state.users.mustLoad) {
        dispatch(setLoading('users'))
        dispatch(fetchResults('users'))
      }
      if (state.meetingsTypes.mustLoad) {
        dispatch(setLoading('meetingsTypes'))
        dispatch(fetchResults('meetingsTypes'))
      }
      dispatch(setLoading('circle'))
      dispatch(fetchCircle())
    } else if (action.payload.pathname === '/createIssue') {
      if (state.circles.mustLoad) {
        dispatch(setLoading('circles'))
        dispatch(fetchResults('circles'))
      }
      if (newQuery.grouper === 'milestone' || newQuery.grouper === 'project') {
        dispatch(setParams(newQuery))
        dispatch(fetchRepositoryWithoutLabels(newQuery.group.split(' ⦔ ')[0]))
      } else {
        dispatch(setParams({ grouper: '', group: '' }))
        if (state.repositories.mustLoad) {
          dispatch(setLoading('repositories'))
          dispatch(fetchResults('repositories'))
        }
      }
    } else if (action.payload.pathname === '/meetings') {
      dispatch(
        setMeetingParams({
          circle_id: newQuery.circle_id ? newQuery.circle_id : '',
          meeting_name: newQuery.meeting_name ? newQuery.meeting_name : '',
        })
      )
      if (state.labels.mustLoad) {
        dispatch(setLoading('labels'))
        dispatch(fetchResults('labels'))
      }
      if (state.circles.mustLoad) {
        dispatch(setLoading('circles'))
        dispatch(fetchResults('circles'))
      }
      if (state.meetingsTypes.mustLoad) {
        dispatch(setLoading('meetingsTypes'))
        dispatch(fetchResults('meetingsTypes'))
      }
      dispatch(setLoading('meetings'))
      dispatch(fetchResults('meetings'))
    }
  }
  return rv
}
