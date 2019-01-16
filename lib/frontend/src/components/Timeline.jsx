import './Timeline.sass'

import block from 'bemboo'
import { format, startOfMonth } from 'date-fns'
import { parse, stringify } from 'query-string'
import React from 'react'
import { Helmet } from 'react-helmet'
import { push } from 'connected-react-router'

import { fetchResults, setLoading } from '../actions'
import { connect, timelineRangeFromState, values } from '../utils'
import Loading from './Loading'
import Milestone from './Milestone'

@block
class Timeline extends React.Component {
  componentDidMount() {
    this.props.sync()
  }

  componentDidUpdate(prevProps) {
    if (this.props.location.search !== prevProps.location.search) {
      this.props.sync()
    }
  }

  render(b) {
    const {
      circles,
      labels,
      range,
      query,
      loading,
      error,
      milestones,
      onCheckboxChange,
      onDateChange,
    } = this.props
    let milestonesByMonth = values(
      milestones.reduce((months, milestone) => {
        let month, monthStr
        if (!milestone.due_on && !range.withoutDueDate) {
          return months
        }
        if (milestone.due_on) {
          month = startOfMonth(milestone.due_on)
          monthStr = format(month, 'YYYY-MM')
          if (months[monthStr] === void 0) {
            months[monthStr] = {
              month: month,
              milestones: [],
            }
          }
          months[monthStr].milestones.push(milestone)
        } else {
          month = 'No Due Date'
          monthStr = month
          if (months[monthStr] === void 0) {
            months[monthStr] = {
              month: month,
              milestones: [],
            }
          }
          months[monthStr].milestones.push(milestone)
        }
        return months
      }, {})
    )
    milestonesByMonth = milestonesByMonth.sort((a, c) => a.month - c.month)
    return (
      <section className={b}>
        <Helmet>
          <title>Gibolt - Timeline</title>
        </Helmet>
        <h1 className={b.e('head')}>
          Timeline from
          <input
            type="date"
            value={range.start}
            onChange={e => onDateChange(e.target.value, 'start', query)}
          />
          to
          <input
            type="date"
            value={range.stop}
            onChange={e => onDateChange(e.target.value, 'stop', query)}
          />
          <input
            id="checkbox"
            type="checkbox"
            onChange={event => onCheckboxChange(event, query)}
            checked={range.withoutDueDate === 'true'}
          />
          <label className={b.e('check')} htmlFor="checkbox">
            display milestones without due date
          </label>
        </h1>
        {loading && <Loading />}
        {error && (
          <article className={b.e('date', { error: true })}>
            <h2>Error during timeline fetch</h2>
            <code>{error}</code>
          </article>
        )}
        {milestonesByMonth
          .filter(mil => mil.month !== 'No Due Date')
          .map(({ id, month, milestones }) => (
            <article key={id} className={b.e('date')}>
              <h2>
                {format(month, 'MMMM YYYY')} <sup>({milestones.length})</sup>
              </h2>
              <ul>
                {milestones.map(milestone => (
                  <Milestone
                    key={milestone.id}
                    milestone_id={milestone.id}
                    milestone_number={milestone.number}
                    state={milestone.state}
                    due_on={milestone.due_on}
                    repo={milestone.repo}
                    html_url={milestone.html_url}
                    title={milestone.title}
                    open_issues={milestone.open_issues}
                    closed_issues={milestone.closed_issues}
                    is_in_edition={milestone.is_in_edition}
                    assoc_circles={milestone.circles}
                    circles={circles}
                    labels={labels}
                  />
                ))}
              </ul>
            </article>
          ))}
        {range.withoutDueDate === 'true' &&
          milestonesByMonth
            .filter(mil => mil.month === 'No Due Date')
            .map(({ id, milestones }) => (
              <article key={id} className={b.e('date')}>
                <h2>
                  {'Open milestones without due date'}{' '}
                  <sup>({milestones.length})</sup>
                </h2>
                <ul>
                  {milestones.map(milestone => (
                    <Milestone
                      key={milestone.id}
                      milestone_id={milestone.id}
                      milestone_number={milestone.number}
                      state={milestone.state}
                      due_on={milestone.due_on}
                      repo={milestone.html_url.split('/')[4]}
                      html_url={milestone.html_url}
                      title={milestone.title}
                      open_issues={milestone.open_issues}
                      closed_issues={milestone.closed_issues}
                      is_in_edition={milestone.is_in_edition}
                      assoc_circles={milestone.circles}
                      circles={circles}
                      labels={labels}
                    />
                  ))}
                </ul>
              </article>
            ))}
      </section>
    )
  }
}
export default connect(
  state => ({
    query: parse(state.router.location.search),
    milestones: state.timeline.results.milestones,
    loading: state.timeline.loading,
    error: state.timeline.error,
    range: timelineRangeFromState(state),
    circles: state.circles.results,
    labels: state.labels.results.circle,
    location: state.router.location,
  }),
  dispatch => ({
    onCheckboxChange: (e, query) => {
      dispatch(
        push({
          pathname: '/timeline',
          search: stringify({
            ...query,
            ['withoutDueDate']: e.target.checked,
          }),
        })
      )
    },
    onDateChange: (date, type, query) => {
      dispatch(
        push({
          pathname: '/timeline',
          search: stringify({
            ...query,
            [type]: date || void 0,
          }),
        })
      )
    },
    sync: () => {
      dispatch(setLoading('timeline'))
      dispatch(fetchResults('timeline'))
      dispatch(setLoading('circles'))
      dispatch(fetchResults('circles'))
      dispatch(setLoading('labels'))
      dispatch(fetchResults('labels'))
    },
  })
)(Timeline)
