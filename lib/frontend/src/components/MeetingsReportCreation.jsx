import './MeetingsReportCreation.sass'

import { parse } from 'query-string'
import React from 'react'
import { Helmet } from 'react-helmet'
import { withRouter } from 'react-router-dom'

import { fetchResults, goBack, setLoading, setParams } from '../actions'
import { fetchCircle } from '../actions/circle'
import { submitReport, updateReportsList } from '../actions/meetings'
import { block, connect } from '../utils'
import Loading from './Loading'
import MarkdownEditor from './MarkdownEditor'

const b = block('MeetingsReportCreation')

class MeetingsReportCreation extends React.Component {
  componentWillMount() {
    const search = parse(this.props.location.search)
    this.props.sync({
      circle_id: search.circle_id ? +search.circle_id : '',
      meeting_name: search.meeting_name ? search.meeting_name : '',
    })
  }

  render() {
    const {
      circle,
      circles,
      history,
      items,
      meetings,
      meetingsTypes,
      onGoBack,
      onSelectChange,
      onSubmit,
      params,
      roles,
      search,
    } = this.props
    return (
      <section className={b()}>
        <Helmet>
          <title>Gibolt - Create a report</title>
        </Helmet>
        {(circles.error || meetingsTypes.error || meetings.error) && (
          <article className={b('group', { error: true })}>
            <h2>Error during fetch or creation</h2>
            <code>
              {circles.error
                ? `circles : ${circles.error}`
                : meetingsTypes.error
                  ? `Meetings types: ${meetingsTypes.error}`
                  : `Reports: ${meetings.error}`}
            </code>
          </article>
        )}
        {(circles.loading || meetingsTypes.loading) && <Loading />}
        <article className={b('meetings')}>
          <h2>Create a report</h2>
          <form onSubmit={event => event.preventDefault()}>
            <label>
              Circle:
              <select
                id="circles"
                name="circles"
                value={params.circle_id}
                disabled={search !== ''}
                onChange={event => onSelectChange(event)}
              >
                <option value="" />
                {circles.results.map(circle => (
                  <option key={circle.circle_id} value={circle.circle_id}>
                    {circle.circle_name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Meetings:
              <select
                id="meetingType"
                name="meetingType"
                value={params.meeting_name}
                disabled={search !== ''}
                onChange={event => onSelectChange(event)}
              >
                <option value="" />
                {meetingsTypes.results.map(type => (
                  <option key={type.type_id} value={type.type_name}>
                    {type.type_name}
                  </option>
                ))}
              </select>
            </label>
            <br />
            {circle &&
              circle.results &&
              circle.results.roles &&
              circle.results.roles.length > 0 && (
                <span>
                  <label>
                    <h3>Recurrent actions:</h3>
                    {items &&
                      roles &&
                      items.filter(item => item.item_type === 'checklist') &&
                      items
                        .filter(item => item.item_type === 'checklist')
                        .filter(
                          item =>
                            item.role_id ===
                            roles.find(
                              role => role.circle_id === params.circle_id
                            ).role_id
                        )
                        .map(item => (
                          <li key={item.item_id}>{item.content}</li>
                        ))}
                  </label>
                  <label>
                    <h3>Indicators:</h3>
                    {items &&
                      items.filter(item => item.item_type === 'indicator') &&
                      items
                        .filter(item => item.item_type === 'indicator')
                        .filter(
                          item =>
                            item.role_id ===
                            roles.find(
                              role => role.circle_id === params.circle_id
                            ).role_id
                        )
                        .map(item => (
                          <li key={item.item_id}>
                            <span>{item.content}</span> :{' '}
                            <input type="text" id="indicData" />
                          </li>
                        ))}
                  </label>
                </span>
              )}
            <br />
            <div className={b('content')}>
              <label>
                <h3>Report content:</h3>
                <MarkdownEditor />
              </label>
            </div>
            <article className={b('action')}>
              <button type="submit" onClick={event => onSubmit(event, history)}>
                Submit
              </button>
              <button type="submit" onClick={() => onGoBack(history)}>
                Cancel
              </button>
            </article>
          </form>
        </article>
      </section>
    )
  }
}
export default withRouter(
  connect(
    state => ({
      circle: state.circle,
      circles: state.circles,
      items: state.items.results,
      labels: state.labels.results.qualifier,
      meetings: state.meetings,
      meetingsTypes: state.meetingsTypes,
      roles: state.roles.results,
      search: state.router.location.search,
      params: state.params,
    }),
    dispatch => ({
      onGoBack: history => {
        dispatch(goBack(history))
      },
      onSelectChange: event => {
        dispatch(updateReportsList(event))
      },
      onSubmit: (event, history) => {
        event.preventDefault()
        dispatch(submitReport(event, history))
      },
      sync: locationSearch => {
        dispatch(setParams(locationSearch))
        dispatch(setLoading('circle'))
        dispatch(fetchCircle())
        dispatch(setLoading('circles'))
        dispatch(fetchResults('circles'))
        dispatch(setLoading('meetingsTypes'))
        dispatch(fetchResults('meetingsTypes'))
        dispatch(setLoading('labels'))
        dispatch(fetchResults('labels'))
        dispatch(setLoading('meetings'))
        dispatch(fetchResults('meetings'))
        dispatch(setLoading('items'))
        dispatch(fetchResults('items'))
        dispatch(setLoading('roles'))
        dispatch(fetchResults('roles'))
      },
    })
  )(MeetingsReportCreation)
)
