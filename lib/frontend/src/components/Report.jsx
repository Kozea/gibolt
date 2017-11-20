import React, { Component } from 'react'
import { connect } from 'react-redux'
import moment from 'moment'
import { push } from '../actions'
import { block, values, reportRangeFromState } from '../utils'
import Loading from './Loading'
import Milestone from './Milestone'
import './Report.sass'


const groupByMonth = (issues) => {
  return values(issues.reduce((months, issue) => {
    if (!issue.closed_at) {
      return months
    }
    let month = moment(issue.closed_at).startOf('month')
    let monthStr = month.format('LL')
    if (months[monthStr] == undefined) {
      months[monthStr] = {
        month: month,
        issues: []
      }
    }
    months[monthStr].issues.push(issue)
    return months
  }, {})).sort((a, b) => (a.month - b.month))
}

const groupByUser = (issues) => {
  return values(issues.reduce((users, issue) => {
    if (users[issue.assignee.login] == undefined) {
      users[issue.assignee.login] = {
        user: issue.assignee,
        issues: []
      }
    }
    users[issue.assignee.login].issues.push(issue)
    return users
  }, {})).sort((a, b) => (a.user - b.user))
}

const groupByRepository = (issues) => {
  return values(issues.reduce((repositories, issue) => {
    if (repositories[issue.repository.full_name] == undefined) {
      repositories[issue.repository.full_name] = {
        repository: issue.repository,
        issues: []
      }
    }
    repositories[issue.repository.full_name].issues.push(issue)
    return repositories
  }, {})).sort((a, b) => (a.user - b.user))
}

const b = block('Report')
function Report({ range, query, loading, error, issues, onDateChange }) {
  let issuesByMonth = groupByMonth(issues)
  let issuesByUser = groupByUser(issues)

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
      <article className={ b('user') }>
        <h2>Overall</h2>
        { issuesByMonth.map(({ id, month, issues: monthIssues }) =>
          <article key={ id } className={ b('month') }>
            <h3>
              { month.format('LL') }
            </h3>
            <ul>
              { groupByRepository(monthIssues)
                .sort((a, b) => b.issues.length - a.issues.length)
                .map(({ id, repository, issues }) =>
                <li key={ id } className={ b('item') }>
                  <span className={ b('repo') }>{ repository.name } ({  Math.round((100 * (issues.length / monthIssues.length))).toFixed() }%)</span>
                </li>
              )}
            </ul>
          </article>
        )}
      </article>

      { issuesByUser.map(({ id, user, issues: userIssues }) =>
        <article key={ id } className={ b('user') }>
          <h2>{ user.login }</h2>
          { groupByMonth(userIssues).map(({ id, month, issues: monthIssues }) =>
            <article key={ id } className={ b('month') }>
              <h3>
                { month.format('LL') }
              </h3>
              <ul>
                { groupByRepository(monthIssues)
                  .sort((a, b) => b.issues.length - a.issues.length)
                  .map(({ id, repository, issues }) =>
                  <li key={ id } className={ b('item') }>
                    <span className={ b('repo') }>{ repository.name } ({ Math.round((100 * (issues.length / monthIssues.length))).toFixed() }%)</span>
                    <ul className={ b('issues') }>
                      { issues.map(issue =>
                        <li key={ issue.id }>{ issue.title }</li>
                      )}
                    </ul>
                  </li>
                )}
              </ul>
            </article>
          )}
        </article>
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
