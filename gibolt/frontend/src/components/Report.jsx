import React, { Component } from 'react'
import { connect } from 'react-redux'
import moment from 'moment'
import { push } from '../actions'
import { block, values, reportRangeFromState } from '../utils'
import Loading from './Loading'
import Milestone from './Milestone'
import './Report.sass'


const b = block('Report')
function Report({ range, query, loading, error, issues, onDateChange }) {
  // let milestonesByMonth = values(milestones.reduce((months, milestone) => {
  //   if (!milestone.due_on) {
  //     return months
  //   }
  //   let month = moment(milestone.due_on).startOf('month')
  //   let monthStr = month.format('LL')
  //   if (months[monthStr] == undefined) {
  //     months[monthStr] = {
  //       id: milestone.id,
  //       month: month,
  //       milestones: []
  //     }
  //   }
  //   months[monthStr].milestones.push(milestone)
  //   return months
  // }, {}))
  // milestonesByMonth = milestonesByMonth.sort((a, b) => (
  //   a.month - b.month
  // ))
  return (
    <section className={ b }>
      <h1 className={ b('head') }>
        Report from
        <input type="date" value={ range.start }
          onChange={ e => onDateChange(e.target.value, 'start', query)} />
         to
         <input type="date" value={ range.stop }
          onChange={ e => onDateChange(e.target.value, 'stop', query)} />.
      </h1>
      { loading && <Loading /> }
      { error && (
        <article className={ b('date', { error: true }) }>
          <h2>Error during report fetch</h2>
          <code>{ error }</code>
        </article>
      )}
      { issues.map(issue =>
        <div>{ issue.title }</div>
      )}
    </section>
  )
}
export default connect(state => ({
    query: state.router.query,
    issues: state.report.results.issues,
    loading: state.report.loading,
    error: state.report.error,
    range: reportRangeFromState(state)
  }), dispatch => ({
    onDateChange: (date, type, query) => {
      dispatch(push({
        pathname: '/report',
        query: {
          ...query,
          [type]: date || undefined
        }
      }))
    }
  })
)(Report)
