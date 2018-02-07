import './Issues.sass'

import { stringify } from 'query-string'
import React from 'react'
import ReactModal from 'react-modal'
import { Link } from 'react-router-dom'

import { setLoading } from '../actions'
import {
  fetchIssues,
  getAndToggleCommentsExpanded,
  setIssuesSelectness,
  setModal,
  updateIssues,
  toggleExpanded,
  toggleIssue,
} from '../actions/issues'
import {
  block,
  connect,
  filterIssuesOnLabels,
  filterIssuesOnState,
  groupIssues,
  grouperFromState,
  issuesStateFromState,
  sortGroupIssues,
  sortIssues,
} from '../utils'
import Issue from './Issue'
import Loading from './Loading'
import Progress from './Progress'

function checkboxState(issues) {
  var selectedIssues = issues.filter(issue => issue.selected).length
  if (selectedIssues === 0) {
    return 'unchecked'
  }
  if (selectedIssues === issues.length) {
    return 'checked'
  }
  return 'indeterminate'
}

const b = block('Issues')
ReactModal.setAppElement('#root')

class Issues extends React.Component {
  componentDidMount() {
    this.props.sync()
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.location.pathname === this.props.location.pathname &&
      nextProps.location.search !== this.props.location.search
    ) {
      this.props.sync()
    }
  }

  render() {
    const {
      labelFilteredIssues,
      issues,
      issuesState,
      loading,
      grouper,
      error,
      modal,
      onModalClose,
      onModalDisplay,
      onToggleSelected,
      onToggleGrouper,
      onToggleExpanded,
      onToggleCommentsExpanded,
      onChangeTickets,
    } = this.props

    const issuesByGroup = sortGroupIssues(groupIssues(issues, grouper), grouper)
    const closedLen = labelFilteredIssues.filter(
      issue => issue.state === 'closed'
    ).length

    return (
      <section className={b()}>
        <h1 className={b('head')}>
          {issues.length} {issuesState === 'all' ? ' ' : ` ${issuesState} `}
          issues{' '}
          {issuesState === 'all'
            ? ''
            : `over ${labelFilteredIssues.length} in total `}
          {grouper !== 'nogroup' && `grouped by ${grouper}`}{' '}
          <input
            type="checkbox"
            checked={checkboxState(issues) === 'checked'}
            ref={elem =>
              elem &&
              (elem.indeterminate = checkboxState(issues) === 'indeterminate')
            }
            onChange={() =>
              onToggleGrouper(
                issues.map(issue => issue.ticket_id),
                checkboxState(issues) !== 'checked'
              )
            }
          />
          <Progress val={closedLen} total={labelFilteredIssues.length} />
        </h1>
        <ReactModal
          className={b('modal')}
          overlayClassName={b('modal-overlay')}
          isOpen={!!modal}
          onRequestClose={() => onModalClose()}
          shouldCloseOnOverlayClick
        >
          {modal}
          <button onClick={onModalClose}>Close</button>
        </ReactModal>
        {loading && <Loading />}
        {error && (
          <article className={b('group', { error: true })}>
            <h2>Error during issue fetch</h2>
            {typeof error === 'object' ? (
              <ul>
                {error.map(err => (
                  <li key={err.id}>
                    <span className={b('bullet')} />
                    {err.value}
                  </li>
                ))}
              </ul>
            ) : (
              <code>{error}</code>
            )}
          </article>
        )}
        {issuesByGroup.map(({ id, group, issues }) => (
          <article key={id} className={b('group')}>
            <h2>
              {group} <sup>({issues.length})</sup>{' '}
              <input
                type="checkbox"
                checked={checkboxState(issues) === 'checked'}
                ref={elem =>
                  elem &&
                  (elem.indeterminate =
                    checkboxState(issues) === 'indeterminate')
                }
                onChange={() =>
                  onToggleGrouper(
                    issues.map(issue => issue.ticket_id),
                    checkboxState(issues) !== 'checked'
                  )
                }
              />
              {(grouper === 'project' ||
                (grouper === 'milestone' &&
                  (issues[0].milestone_state === 'open' ||
                    group.split(' ⦔ ')[1] === 'No milestone'))) && (
                <Link
                  className={b('link')}
                  to={{
                    pathname: '/createIssue',
                    search:
                      grouper === 'milestone'
                        ? stringify({
                            grouper,
                            group: id.split('|')[1]
                              ? `${group.split(' ⦔ ')[0]} ⦔ ${id.split('|')[1]}` // eslint-disable-line max-len
                              : group,
                          })
                        : stringify({ grouper, group }),
                  }}
                >
                  <button className={b('newTicket')}>Create issue</button>
                </Link>
              )}
              {issuesState === 'all' &&
                grouper !== 'state' && (
                  <Progress
                    val={issues.filter(i => i.state === 'closed').length}
                    total={issues.length}
                  />
                )}
            </h2>
            <ul>
              {sortIssues(issues, grouper).map(issue => (
                <Issue
                  key={issue.ticket_id}
                  id={issue.ticket_number}
                  state={issue.state}
                  closed_at={issue.closed_at}
                  title={issue.ticket_title}
                  body={issue.body}
                  assignee={issue.user}
                  users={issue.assignees}
                  avatars={issue.avatar_url}
                  project={issue.repo_name}
                  labels={issue.labels}
                  milestone_id={issue.milestone_id}
                  milestone_title={issue.milestone_title}
                  selected={issue.selected}
                  url={issue.html_url}
                  pull_request={issue.pull_request}
                  expanded={issue.expanded}
                  comments_expanded={issue.comments_expanded}
                  nb_comments={issue.nb_comments}
                  comments={issue.comments}
                  onBoxChange={() => onToggleSelected(issue.ticket_id)}
                  onClick={() => onToggleExpanded(issue.ticket_id)}
                  onClickComments={() => onToggleCommentsExpanded(issue)}
                  onModalDisplay={() => onModalDisplay(issue.ticket_title)}
                />
              ))}
            </ul>
          </article>
        ))}
        <article className={b('action')}>
          <button type="submit" onClick={() => onChangeTickets('increment')}>
            Increment priority
          </button>
          <button type="submit" onClick={() => onChangeTickets('removeTop')}>
            Remove top priority
          </button>
          <button type="submit" onClick={() => onChangeTickets('close')}>
            Close issue
          </button>
          <Link
            className={b('link')}
            to={{
              pathname: '/createIssue',
            }}
          >
            <button type="submit">Create issue</button>
          </Link>
        </article>
      </section>
    )
  }
}

export default connect(
  state => {
    const labelFilteredIssues = filterIssuesOnLabels(
      state.issues.results.issues,
      state
    )
    return {
      labelFilteredIssues,
      issues: filterIssuesOnState(labelFilteredIssues, state),
      loading: state.issues.loading,
      grouper: grouperFromState(state),
      issuesState: issuesStateFromState(state),
      error: state.issues.error,
      modal: state.modal,
    }
  },
  dispatch => ({
    onModalClose: () => {
      dispatch(setModal(null))
    },
    onModalDisplay: content => {
      dispatch(setModal(content))
    },
    onToggleSelected: issueId => {
      dispatch(toggleIssue(issueId))
    },
    onToggleExpanded: issueId => {
      dispatch(toggleExpanded(issueId))
    },
    onToggleCommentsExpanded: issue => {
      dispatch(getAndToggleCommentsExpanded(issue))
    },
    onToggleGrouper: (issuesId, isSelected) => {
      dispatch(setIssuesSelectness(issuesId, isSelected))
    },
    onChangeTickets: change => {
      dispatch(setLoading('issues'))
      switch (change) {
        case 'removeTop':
          return dispatch(updateIssues('removeSelectedIssuesPriority'))
        case 'increment':
          return dispatch(updateIssues('incrementSelectedIssuesPriority'))
        case 'close':
          return dispatch(updateIssues('closeSelectedIssues'))
      }
    },
    sync: () => {
      dispatch(setLoading('issues'))
      dispatch(fetchIssues())
    },
  })
)(Issues)
