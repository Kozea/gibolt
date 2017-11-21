import { parse } from 'query-string'
import { LOCATION_CHANGE } from 'react-router-redux'

import { fetchResults, setLoading } from '../actions'

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
        dispatch(fetchResults('issues'))
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
      dispatch(setLoading('repository'))
      dispatch(fetchResults('repository'))
    }
  }
  return rv
}
