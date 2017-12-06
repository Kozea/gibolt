import './Timeline.sass'

// import { format, startOfMonth } from 'date-fns'
import moment from 'moment'
import React from 'react'
import { Helmet } from 'react-helmet'
import { push } from 'react-router-redux'
import { connect } from 'react-redux'

import { block, timelineRangeFromState, values } from '../utils'
import Loading from './Loading'
import Milestone from './Milestone'

const b = block('Timeline')

function Timeline({ range, query, loading, error, milestones, onDateChange }) {
  let milestonesByMonth = values(
    milestones.reduce((months, milestone) => {
      if (!milestone.due_on) {
        return months
      }
      const month = moment(milestone.due_on).startOf('month')
      const monthStr = month.format('LL')
      if (months[monthStr] === undefined) {
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
    // console.log('milestonesByMonth'),
    // console.log(milestonesByMonth),
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
        />.
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
            {month.format('MMMM YYYY')} <sup>({milestones.length})</sup>
          </h2>
          <ul>
            {milestones.map(milestone => (
              // console.log('milestone'),
              // console.log(milestones),
              <Milestone
                key={milestone.id}
                state={milestone.state}
                due_on={milestone.due_on}
                repo={milestone.repo_name}
                html_url={milestone.html_url}
                title={milestone.milestone_title}
                open_issues={milestone.open_issues}
                closed_issues={milestone.closed_issues}
              />
            ))}
          </ul>
        </article>
      ))}
    </section>
  )
}
export default connect(
  state => ({
    query: state.router.query,
    milestones: state.timeline.results.milestones,
    loading: state.timeline.loading,
    error: state.timeline.error,
    range: timelineRangeFromState(state),
  }),
  dispatch => ({
    onDateChange: (date, type, query) => {
      dispatch(
        push({
          pathname: '/timeline',
          query: {
            ...query,
            [type]: date || undefined,
          },
        })
      )
    },
  })
)(Timeline)
