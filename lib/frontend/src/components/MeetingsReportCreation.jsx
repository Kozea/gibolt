import './MeetingsReportCreation.sass'

import React from 'react'
import { Helmet } from 'react-helmet'
import { withRouter } from 'react-router-dom'

import { fetchResults, goBack, setLoading } from '../actions'
import { submitReport, updateReportsList } from '../actions/meetings'
import { block, connect } from '../utils'
import Loading from './Loading'
import MarkdownEditor from './MarkdownEditor'

const b = block('MeetingsReportCreation')

class MeetingsReportCreation extends React.Component {
  componentWillMount() {
    this.props.sync()
  }

  render() {
    const {
      circles,
      history,
      meetings,
      meetingsTypes,
      onGoBack,
      onSelectChange,
      onSubmit,
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
                value={meetingsTypes.params.circle_id}
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
                value={meetingsTypes.params.meeting_name}
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
            <div className={b('content')}>
              <label>
                Report content:
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
      circles: state.circles,
      labels: state.labels.results.qualifier,
      meetings: state.meetings,
      meetingsTypes: state.meetingsTypes,
      search: state.router.location.search,
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
      sync: () => {
        dispatch(setLoading('circles'))
        dispatch(fetchResults('circles'))
        dispatch(setLoading('meetingsTypes'))
        dispatch(fetchResults('meetingsTypes'))
        dispatch(setLoading('labels'))
        dispatch(fetchResults('labels'))
        dispatch(setLoading('meetings'))
        dispatch(fetchResults('meetings'))
      },
    })
  )(MeetingsReportCreation)
)
