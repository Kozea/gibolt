import './MeetingsReportCreation.sass'

import { format } from 'date-fns'
import { parse, stringify } from 'query-string'
import React from 'react'
import { Helmet } from 'react-helmet'
import { Link, withRouter } from 'react-router-dom'

import {
  checkMarkdown,
  delMarkdown,
  fetchResults,
  goBack,
  setLoading,
  setParams,
} from '../actions'
import { submitReport, updateReportsList } from '../actions/meetings'
import {
  fetchCircleItems,
  fetchCircleMilestonesAndIssues,
  expandMilestone,
} from '../actions/milestones'
import { block, connect, sortUsers } from '../utils'
import Loading from './Loading'
import MarkdownEditor from './MarkdownEditor'
import Progress from './Progress'

const b = block('MeetingsReportCreation')

class MeetingsReportCreation extends React.Component {
  constructor(props, context) {
    super(props, context)
    this.state = {
      selectedCircle: {},
    }
  }
  componentWillMount() {
    this.props.updateMarkdown()
  }
  componentDidMount() {
    const search = parse(this.props.location.search)
    this.props.sync({
      circle_id: search.circle_id ? +search.circle_id : '',
      meeting_name: search.meeting_name ? search.meeting_name : '',
    })
  }
  componentWillReceiveProps(nextProps) {
    if (
      nextProps.circles !== this.props.circles ||
      nextProps.params.circle_id !== this.props.params.circle_id ||
      nextProps.params.meeting_name !== this.props.params.meeting_name
    ) {
      if (nextProps.circles.results.length > 0) {
        this.setState({
          selectedCircle:
            nextProps.circles.results.filter(
              circle => circle.circle_id === nextProps.params.circle_id
            ).length > 0
              ? nextProps.circles.results.filter(
                  circle => circle.circle_id === nextProps.params.circle_id
                )[0]
              : {},
        })
      }
      if (nextProps.params.meeting_name === 'Triage') {
        this.props.getMilestonesAndItems(nextProps.params.circle_id)
      }
    }
  }

  getUsersListFromRoles(roles, users) {
    const usersList = roles.map(
      role => users.filter(user => role.user_id === user.user_id)[0]
    )
    if (usersList.length > 0) {
      return Array.from(new Set(usersList))
    }
    return []
  }

  render() {
    const {
      circleMilestones,
      circles,
      errors,
      history,
      issues,
      items,
      loading,
      meetingsTypes,
      onGoBack,
      onMilestoneClick,
      onSelectChange,
      onSubmit,
      params,
      search,
      users,
    } = this.props
    const { selectedCircle } = this.state
    selectedCircle.selectedCircle = this.state.selectedCircle
    let usersList = []
    if (selectedCircle.roles && users) {
      usersList = this.getUsersListFromRoles(selectedCircle.roles, users)
    }
    if (usersList.length > 0) {
      usersList = sortUsers(usersList)
    }

    return (
      <section className={b()}>
        <Helmet>
          <title>Gibolt - Create a report</title>
        </Helmet>
        {loading !== 0 && <Loading />}
        <article className={b('meetings')}>
          <h2>Create a report</h2>
          {errors.circles ||
          errors.items ||
          errors.meetingsTypes ||
          errors.projects ||
          errors.users ? (
            <article className={b('group', { error: true })}>
              <h2>Error during fetch</h2>
              <code>
                {Object.keys(errors).map(
                  key =>
                    errors[key] === null ? (
                      ''
                    ) : (
                      <div>{`${key}: ${errors[key]} `}</div>
                    )
                )}
              </code>
              <br />
            </article>
          ) : (
            <span>
              {errors.meetings && (
                <article className={b('group', { error: true })}>
                  <h2>Error during creation</h2>
                  <code>{`meetings : ${errors.meetings}`}</code>
                  <br />
                </article>
              )}
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
                <div className={b('content')}>
                  <span>
                    <h3>Presents:</h3>
                    {selectedCircle.roles && (
                      <span>
                        {selectedCircle.roles.length > 0 &&
                        usersList.length > 0 ? (
                          <ul>
                            {usersList.map(
                              user =>
                                user && (
                                  <li key={user.user_id}>
                                    <input
                                      type="checkbox"
                                      name={user.user_name}
                                      id="users"
                                      defaultChecked
                                    />
                                    {user.user_name}
                                  </li>
                                )
                            )}
                          </ul>
                        ) : (
                          'No roles defined'
                        )}
                      </span>
                    )}
                  </span>
                  {params.meeting_name === 'Triage' && (
                    <span>
                      {selectedCircle.roles &&
                        selectedCircle.roles.length > 0 && (
                          <span>
                            <h3>Recurrent actions:</h3>
                            <ul>
                              {items &&
                                items.map(
                                  roleItems =>
                                    roleItems.items &&
                                    roleItems.items
                                      .filter(
                                        item => item.item_type === 'checklist'
                                      )
                                      .map(item => (
                                        <li key={item.item_id}>
                                          <input
                                            type="checkbox"
                                            name={`${roleItems.role_name} - ${
                                              item.content
                                            }`}
                                            id="actions"
                                          />
                                          {roleItems.role_name} - {item.content}
                                        </li>
                                      ))
                                )}
                            </ul>
                            <h3>Indicators:</h3>
                            <ul>
                              {items &&
                                items.map(
                                  roleItems =>
                                    roleItems.items &&
                                    roleItems.items
                                      .filter(
                                        item => item.item_type === 'indicator'
                                      )
                                      .map(item => (
                                        <li key={item.item_id}>
                                          <span className={b('bullet')} />
                                          {roleItems.role_name} - {item.content}
                                          :{' '}
                                          <input
                                            type="text"
                                            name={`${roleItems.role_name} - ${
                                              item.content
                                            }`}
                                            id="indicateurs"
                                            className="smallInput"
                                          />
                                        </li>
                                      ))
                                )}
                            </ul>
                          </span>
                        )}
                      <h3>Projects:</h3>
                      <ul>
                        {circleMilestones.length > 0 &&
                          circleMilestones.map(milestone => (
                            <li
                              key={milestone.milestone_number}
                              title={milestone.description}
                            >
                              <a
                                className={b('unlink')}
                                href={milestone.html_url}
                                target="_blank"
                              >
                                <span
                                  className={b(`bullet ${milestone.state}`)}
                                />
                                {milestone.repo_name}
                                {' - '}
                                <span className={b('lab')}>
                                  {milestone.milestone_title}
                                </span>
                              </a>
                              {' -'}
                              <Progress
                                val={milestone.closed_issues}
                                total={
                                  milestone.open_issues +
                                  milestone.closed_issues
                                }
                              />
                              <span className={b('due-date')}>
                                {' ('}
                                {milestone.due_on
                                  ? `due on: ${format(
                                      new Date(milestone.due_on),
                                      'DD/MM/YYYY'
                                    )}`
                                  : 'no due date'}
                                {')'}
                              </span>
                              {milestone.state === 'open' && (
                                <Link
                                  className={b('unlink')}
                                  target="_blank"
                                  title="open an issue"
                                  to={{
                                    pathname: '/createIssue',
                                    search: stringify({
                                      grouper: 'milestone',
                                      group: `${milestone.repo_name} ⦔ ${
                                        milestone.milestone_number
                                      }`,
                                    }),
                                  }}
                                >
                                  <i
                                    className="fa fa-plus-circle addCircle"
                                    aria-hidden="true"
                                  />
                                </Link>
                              )}
                              {issues.length > 0 &&
                                issues.filter(
                                  issue =>
                                    issue.milestone_id ===
                                    milestone.milestone_id
                                ).length > 0 && (
                                  <span>
                                    <span
                                      className={b('lighter')}
                                      onClick={() =>
                                        onMilestoneClick(milestone.milestone_id)
                                      }
                                    >
                                      show/hide closed issues since last report
                                    </span>
                                    {milestone.is_expanded && (
                                      <span>
                                        <br />
                                        <ul className={b('tickets')}>
                                          {issues
                                            .filter(
                                              issue =>
                                                issue.milestone_number ===
                                                  milestone.milestone_number &&
                                                !issue.pull_request
                                            )
                                            .map(issue => (
                                              <li
                                                key={issue.ticket_id}
                                                title={issue.body}
                                              >
                                                <span className={b('bullet')} />
                                                <a
                                                  href={issue.html_url}
                                                  target="_blank"
                                                >
                                                  #{issue.ticket_number}
                                                </a>{' '}
                                                {issue.ticket_title},
                                                <span className={b('lighter')}>
                                                  closed:{' '}
                                                  {format(
                                                    new Date(issue.closed_at),
                                                    'DD/MM/YYYY HH:mm'
                                                  )}
                                                  , last update:{' '}
                                                  {format(
                                                    new Date(issue.updated_at),
                                                    'DD/MM/YYYY HH:mm'
                                                  )}
                                                </span>
                                                {issue.assignees.map(user => (
                                                  <img
                                                    key={user.user_id}
                                                    className={b('avatar')}
                                                    src={user.avatar_url}
                                                    alt="avatar"
                                                    title={user.user_name}
                                                  />
                                                ))}
                                              </li>
                                            ))}
                                        </ul>
                                      </span>
                                    )}
                                  </span>
                                )}
                              <br />
                              <input
                                className="largeInput"
                                id="milestones"
                                name={milestone.milestone_title}
                              />
                            </li>
                          ))}
                      </ul>
                    </span>
                  )}
                  <h3>Report content:</h3>
                  <MarkdownEditor />
                </div>
                <article className={b('action')}>
                  <button
                    type="submit"
                    onClick={event =>
                      onSubmit(event, params.meeting_name, history)
                    }
                  >
                    Submit
                  </button>
                  <button type="submit" onClick={() => onGoBack(history)}>
                    Cancel
                  </button>
                </article>
              </form>
            </span>
          )}
        </article>
      </section>
    )
  }
}
export default withRouter(
  connect(
    state => ({
      circleMilestones: state.circleMilestones.results,
      circles: state.circles,
      errors: {
        circles: state.circles.error,
        items: state.items.error,
        meetings: state.meetings.error,
        meetingsTypes: state.meetingsTypes.error,
        projects: state.circleMilestones.error,
        users: state.users.error,
      },
      items: state.items.results,
      issues: state.issues.results.issues,
      meetingsTypes: state.meetingsTypes,
      search: state.router.location.search,
      params: state.params,
      users: state.users.results,
      loading:
        (state.circleMilestones.loading ? 1 : 0) +
        (state.circles.loading ? 1 : 0) +
        (state.items.loading ? 1 : 0) +
        (state.issues.loading ? 1 : 0) +
        (state.users.loading ? 1 : 0),
    }),
    dispatch => ({
      getMilestonesAndItems: circleId => {
        dispatch(setLoading('circleMilestones'))
        dispatch(setLoading('items'))
        dispatch(setLoading('issues'))
        dispatch(fetchCircleMilestonesAndIssues(circleId))
        dispatch(fetchCircleItems(circleId))
      },
      onGoBack: history => {
        dispatch(delMarkdown())
        dispatch(goBack(history))
      },
      onMilestoneClick: milestoneId => {
        dispatch(expandMilestone(milestoneId))
      },
      onSelectChange: event => {
        dispatch(updateReportsList(event))
      },
      onSubmit: (event, meetingType, history) => {
        event.preventDefault()
        dispatch(submitReport(event, meetingType, history))
        dispatch(delMarkdown())
      },
      sync: locationSearch => {
        dispatch(setParams(locationSearch))
        dispatch(setLoading('users'))
        dispatch(fetchResults('users'))
        dispatch(setLoading('circles'))
        dispatch(fetchResults('circles'))
        dispatch(setLoading('meetingsTypes'))
        dispatch(fetchResults('meetingsTypes'))
        dispatch(setLoading('labels'))
        dispatch(fetchResults('labels'))
        dispatch(setLoading('meetings'))
        dispatch(fetchResults('meetings'))
      },
      updateMarkdown: () => {
        dispatch(checkMarkdown('### Ordre du jour:'))
      },
    })
  )(MeetingsReportCreation)
)
