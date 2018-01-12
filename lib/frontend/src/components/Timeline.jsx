import './Timeline.sass'

import { format, startOfMonth } from 'date-fns'
import { parse, stringify } from 'query-string'
import React from 'react'
import { Helmet } from 'react-helmet'
import { push } from 'react-router-redux'

import { fetchResults, setLoading } from '../actions'
import { block, connect, timelineRangeFromState, values } from '../utils'
import Loading from './Loading'
import Milestone from './Milestone'

const b = block('Timeline')

class Timeline extends React.Component {
  componentWillMount() {
    this.props.sync()
  }

  render() {
    const {
      circles,
      labels,
      range,
      query,
      loading,
      error,
      milestones,
      onDateChange,
    } = this.props

    let milestonesByMonth = values(
      milestones.reduce((months, milestone) => {
        if (!milestone.due_on) {
          return months
        }
        const month = startOfMonth(milestone.due_on)
        const monthStr = format(month, 'YYYY-MM')
        if (months[monthStr] === void 0) {
          months[monthStr] = {
            month: month,
            milestones: [],
          }
        }
        months[monthStr].milestones.push(milestone)
        return months
      }, {})
    )
    milestonesByMonth = milestonesByMonth.sort((a, b) => a.month - b.month)
    return (
      <section className={b()}>
        <Helmet>
          <title>Gibolt - Timeline</title>
        </Helmet>
        <h1 className={b('head')}>
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
          <input id="checkbox" type="checkbox" value={'display'} />
          <label className={b('check')} htmlFor="checkbox">
            display milestones without due date
          </label>
        </h1>
        {loading && <Loading />}
        {error && (
          <article className={b('date', { error: true })}>
            <h2>Error during timeline fetch</h2>
            <code>{error}</code>
          </article>
        )}
        {milestonesByMonth.map(({ id, month, milestones }) => (
          <article key={id} className={b('date')}>
            <h2>
              {format(month, 'MMMM YYYY')} <sup>({milestones.length})</sup>
            </h2>
            <ul>
              {milestones.map(milestone => (
                <Milestone
                  key={milestone.id}
                  state={milestone.state}
                  due_on={milestone.due_on}
                  repo={milestone.repo}
                  html_url={milestone.html_url}
                  title={milestone.title}
                  open_issues={milestone.open_issues}
                  closed_issues={milestone.closed_issues}
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
    labels: state.labels.results.qualifier,
  }),
  dispatch => ({
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
