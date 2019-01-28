import './Report.sass'

import block from 'bemboo'
import moment from 'moment'
import React from 'react'
import { Helmet } from 'react-helmet'
import { push } from 'connected-react-router'

import { fetchResults, setLoading } from '../actions'
import { connect, reportRangeFromState, values } from '../utils'
import { stringify } from '../utils/querystring'
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

@block
class Report extends React.Component {
  componentDidMount() {
    this.props.sync()
  }

  componentDidUpdate(prevProps) {
    if (this.props.location.query !== prevProps.location.query) {
      this.props.sync()
    }
  }

  render(b) {
    const { range, query, loading, error, issues, onDateChange } = this.props
    const issuesByMonth = groupByMonth(issues)
    const issuesByUser = groupByUser(issues)

    return (
      <section className={b}>
        <Helmet>
          <title>Gibolt - Report</title>
        </Helmet>
        <h1 className={b.e('head')}>
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
          />
          .
        </h1>
        {loading && <Loading />}
        {error && (
          <article className={b.e('date').m({ error: true })}>
            <h2>Error during report fetch</h2>
            <code>{error}</code>
          </article>
        )}
        <article className={b.e('user')}>
          <h2>Overall</h2>
          {issuesByMonth.map(({ id, month, issues: monthIssues }) => (
            <article key={id} className={b.e('month')}>
              <h3>{month.format('LL')}</h3>
              <ul>
                {groupByRepository(monthIssues)
                  .sort((x, y) => y.issues.length - x.issues.length)
                  .map(({ repository, issues }) => (
                    <li key={repository.id} className={b.e('item')}>
                      <span className={b.e('repo')}>
                        {repository.name} (
                        {Math.round(
                          100 * (issues.length / monthIssues.length)
                        ).toFixed()}
                        %)
                      </span>
                    </li>
                  ))}
              </ul>
            </article>
          ))}
        </article>

        {issuesByUser.map(({ id, user, issues: userIssues }) => (
          <article key={id} className={b.e('user')}>
            <h2>{user.login}</h2>
            {groupByMonth(userIssues).map(
              ({ id, month, issues: monthIssues }) => (
                <article key={id} className={b.e('month')}>
                  <h3>{month.format('LL')}</h3>
                  <ul>
                    {groupByRepository(monthIssues)
                      .sort((x, y) => y.issues.length - x.issues.length)
                      .map(({ repository, issues }) => (
                        <li key={repository.id} className={b.e('item')}>
                          <span className={b.e('repo')}>
                            {repository.name} (
                            {Math.round(
                              100 * (issues.length / monthIssues.length)
                            ).toFixed()}
                            %)
                          </span>
                          <ul className={b.e('issues')}>
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
