import './Report.sass'

import moment from 'moment'
import { stringify } from 'query-string'
import React from 'react'
import { Helmet } from 'react-helmet'
import { push } from 'react-router-redux'

import { fetchResults, setLoading } from '../actions'
import { block, connect, reportRangeFromState, values } from '../utils'
import Loading from './Loading'

const groupByMonth = issues =>
  values(
    issues.reduce((months, issue) => {
      if (!issue.closed_at) {
        return months
      }
      const month = moment(issue.closed_at).startOf('month')
      const monthStr = month.format('LL')
      if (months[monthStr] === void 0) {
        months[monthStr] = {
          month: month,
          issues: [],
        }
      }
      months[monthStr].issues.push(issue)
      return months
    }, {})
  ).sort((a, b) => a.month - b.month)

const groupByUser = issues =>
  values(
    issues.reduce((users, issue) => {
      if (users[issue.assignee.login] === void 0) {
        users[issue.assignee.login] = {
          user: issue.assignee,
          issues: [],
        }
      }
      users[issue.assignee.login].issues.push(issue)
      return users
    }, {})
  ).sort((a, b) => a.user - b.user)

const groupByRepository = issues =>
  values(
    issues.reduce((repositories, issue) => {
      if (repositories[issue.repository.full_name] === void 0) {
        repositories[issue.repository.full_name] = {
          repository: issue.repository,
          issues: [],
        }
      }
      repositories[issue.repository.full_name].issues.push(issue)
      return repositories
    }, {})
  ).sort((a, b) => a.user - b.user)

const b = block('Report')

class Report extends React.Component {
  componentDidMount() {
    this.props.sync()
  }

  componentDidUpdate(prevProps) {
    if (this.props.location.query !== prevProps.location.query) {
      this.props.sync()
    }
  }

  render() {
    const { range, query, loading, error, issues, onDateChange } = this.props
    const issuesByMonth = groupByMonth(issues)
    const issuesByUser = groupByUser(issues)

    return (
      <section className={b()}>
        <Helmet>
          <title>Gibolt - Report</title>
        </Helmet>
        <h1 className={b('head')}>
          Report from
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
            <h2>Error during report fetch</h2>
            <code>{error}</code>
          </article>
        )}
        <article className={b('user')}>
          <h2>Overall</h2>
          {issuesByMonth.map(({ id, month, issues: monthIssues }) => (
            <article key={id} className={b('month')}>
              <h3>{month.format('LL')}</h3>
              <ul>
                {groupByRepository(monthIssues)
                  .sort((x, y) => y.issues.length - x.issues.length)
                  .map(({ repoId, repository, issues }) => (
                    <li key={repoId} className={b('item')}>
                      <span className={b('repo')}>
                        {repository.name} ({Math.round(
                          100 * (issues.length / monthIssues.length)
                        ).toFixed()}%)
                      </span>
                    </li>
                  ))}
              </ul>
            </article>
          ))}
        </article>

        {issuesByUser.map(({ id, user, issues: userIssues }) => (
          <article key={id} className={b('user')}>
            <h2>{user.login}</h2>
            {groupByMonth(userIssues).map(
              ({ monthId, month, issues: monthIssues }) => (
                <article key={monthId} className={b('month')}>
                  <h3>{month.format('LL')}</h3>
                  <ul>
                    {groupByRepository(monthIssues)
                      .sort((x, y) => y.issues.length - x.issues.length)
                      .map(({ issueId, repository, issues }) => (
                        <li key={issueId} className={b('item')}>
                          <span className={b('repo')}>
                            {repository.name} ({Math.round(
                              100 * (issues.length / monthIssues.length)
                            ).toFixed()}%)
                          </span>
                          <ul className={b('issues')}>
                            {issues.map(issue => (
                              <li key={issue.id}>{issue.title}</li>
                            ))}
                          </ul>
                        </li>
                      ))}
                  </ul>
                </article>
              )
            )}
          </article>
        ))}
      </section>
    )
  }
}
export default connect(
  state => ({
    query: state.router.query,
    issues: state.report.results.issues,
    loading: state.report.loading,
    error: state.report.error,
    range: reportRangeFromState(state),
    location: state.router.location,
  }),
  dispatch => ({
    onDateChange: (date, type, query) => {
      dispatch(
        push({
          pathname: '/report',
          query: stringify({
            ...query,
            [type]: date || void 0,
          }),
        })
      )
    },
    sync: () => {
      dispatch(setLoading('report'))
      dispatch(fetchResults('report'))
    },
  })
)(Report)
