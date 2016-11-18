import React, { Component } from 'react'
import { connect } from 'react-redux'
import moment from 'moment'
import { push } from '../actions'
import { block, values, timelineRangeFromState } from '../utils'
import Loading from './Loading'
import Milestone from './Milestone'
import './Timeline.sass'


const b = block('Timeline')
function Timeline({ range, query, loading, error, milestones, onDateChange }) {
  let milestonesByMonth = values(milestones.reduce((months, milestone) => {
    if (!milestone.due_on) {
      return months
    }
    let month = moment(milestone.due_on).startOf('month')
    let monthStr = month.format('LL')
    if (months[monthStr] == undefined) {
      months[monthStr] = {
        id: milestone.id,
        month: month,
        milestones: []
      }
    }
    months[monthStr].milestones.push(milestone)
    return months
  }, {}))
  milestonesByMonth = milestonesByMonth.sort((a, b) => (
    a.month - b.month
  ))
  return (
    <section className={ b }>
      <h1 className={ b('head') }>
        Timeline from
        <input type="date" value={ range.start }
          onChange={ e => onDateChange(e.target.value, 'start', query)} />
         to
         <input type="date" value={ range.stop }
          onChange={ e => onDateChange(e.target.value, 'stop', query)} />.
      </h1>
      { loading && <Loading /> }
      { error && (
        <article className={ b('date', { error: true }) }>
          <h2>Error during timeline fetch</h2>
          <code>{ error }</code>
        </article>
      )}
      { milestonesByMonth.map(({ id, month, milestones }) =>
        <article key={ month.format('LL') } className={ b('date') }>
          <h2>{ month.format('LL') } <sup>
            ({ milestones.length })
            </sup>
          </h2>
          <ul>
            { milestones.map(milestone =>
              <Milestone key={ milestone.id }
                state={ milestone.state }
                due_on={ milestone.due_on }
                repo={ milestone.repo }
                html_url={ milestone.html_url }
                title={ milestone.title }
                open_issues={ milestone.open_issues }
                closed_issues={ milestone.closed_issues }
                />
            )}
          </ul>
        </article>
      )}
    </section>
  )
}
export default connect(state => ({
    query: state.router.query,
    milestones: state.timeline.results.milestones,
    loading: state.timeline.loading,
    error: state.timeline.error,
    range: timelineRangeFromState(state)
  }), dispatch => ({
    onDateChange: (date, type, query) => {
      dispatch(push({
        pathname: '/timeline',
        query: {
          ...query,
          [type]: date || undefined
        }
      }))
    }
  })
)(Timeline)
