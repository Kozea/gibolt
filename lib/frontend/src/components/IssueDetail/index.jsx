import './IssueDetail.sass'

import { format } from 'date-fns'
import React from 'react'
import Octicon from 'react-component-octicons'

import { checkMarkdown } from '../../actions'
import { fetchCircle } from '../../actions/circle'
import {
  changeMilestoneSelect,
  changeRolesSelect,
} from '../../actions/issueForm'
import {
  getAndToggleCommentsExpanded,
  getOptionsLabels,
  updateATicket,
  addOrUpdateComment,
  updateLabelsList,
} from '../../actions/issues'
import { block, connect } from '../../utils'
import IssueStatusIcon from './../Utils/IssueStatusIcon'
import LabelMultiSelect from './../Utils/LabelMultiSelect'
import MarkdownEditor from './../Utils/MarkdownEditor'

const b = block('IssueDetail')
var ReactMarkdown = require('react-markdown')

class IssueDetail extends React.Component {
  constructor(props, context) {
    super(props, context)
    this.state = {
      isInEdition: null,
      areLabelsInEdtion: false,
      issue: this.props.issue,
      issuesLabels: [],
      options: [],
      circleLabelId: '',
    }
    this.props.getMilestones(this.props.issue.repo_name)
  }

  componentWillReceiveProps(nextProps) {
    // in case of updated issue doesn't fit filters anymore
    const issue = nextProps.issue ? nextProps.issue : nextProps.currentIssue
    if (issue.labels) {
      const data = getOptionsLabels(issue, nextProps.labels)
      if (data.circleLabelId !== this.state.circleLabelId) {
        this.props.getCircle(data.circleLabelId)
      }
      this.setState({
        issue,
        issuesLabels: data.issuesLabels,
        options: data.options,
        circleLabelId: data.circleLabelId,
      })
    }
  }

  updateEditionStatus(value) {
    this.setState({ isInEdition: value })
  }

  render() {
    const {
      milestones,
      onModalClose,
      onToggleCommentsExpanded,
      onUpdateComment,
      onUpdateIssue,
      onUpdateIssueLabels,
      roles,
      updateMarkdown,
    } = this.props
    const { isInEdition, issue, options, issuesLabels } = this.state

    return (
      <section className={b()}>
        <span
          className={b({
            status: issue.state,
            'pull-request': issue.pull_request !== null,
          })}
        >
          <span className="close" onClick={onModalClose}>
            &times;
          </span>
          <span className={b('ttl')}>
            <a href={issue.html_url} target="_blank">
              #{issue.ticket_number}
            </a>{' '}
            {isInEdition === 'title' ? (
              <form
                onSubmit={e => {
                  e.preventDefault()
                  onUpdateIssue({ title: e.target.titleInput.value }, issue)
                  this.updateEditionStatus(null)
                }}
              >
                <input
                  name="titleInput"
                  defaultValue={issue.ticket_title}
                  className="inputTitle"
                />
                <button type="submit">Update</button>
                <button
                  type="button"
                  onClick={() => this.updateEditionStatus(null)}
                >
                  Cancel
                </button>
              </form>
            ) : (
              <span>
                <span className={b('title')}>{issue.ticket_title} </span>
                <span onClick={() => this.updateEditionStatus('title')}>
                  <i className="fa fa-pencil faTop" title="edit title" />
                </span>
              </span>
            )}
            {isInEdition !== 'assignee' && (
              <span>
                {issue.assignees.map(user => (
                  <img
                    key={user.user_id}
                    className={b('avatar')}
                    src={user.avatar_url}
                    alt="avatar"
                    title={user.user_name}
                  />
                ))}
                <span onClick={() => this.updateEditionStatus('assignee')}>
                  <i className="fa fa-user faTop" title="modify assignees" />
                </span>
              </span>
            )}
          </span>
          {isInEdition === 'assignee' && (
            <span>
              <form
                id="updateAssigneeForm"
                onSubmit={e => {
                  e.preventDefault()
                  onUpdateIssue({ assignees: [e.target.assignee.value] }, issue)
                  this.updateEditionStatus(null)
                }}
              >
                <select
                  id="assignee"
                  name="assignee"
                  defaultValue={
                    issue.assignees[0] ? issue.assignees[0].user_name : ''
                  }
                >
                  <option value="" />
                  {roles.map(role => (
                    <option key={role.role_id} value={role.user_name}>
                      {role.role_name} ({role.user_name})
                    </option>
                  ))}
                </select>
                <button type="submit">Update</button>
                <button
                  type="button"
                  onClick={() => this.updateEditionStatus(null)}
                >
                  Cancel
                </button>
              </form>
            </span>
          )}
          <span className={b('infos')}>
            <IssueStatusIcon issue={issue} />
            {issue.user.user_name} opened this issue, last update:{' '}
            {format(new Date(issue.updated_at), 'DD/MM/YYYY HH:mm:ss')}
            {` · ${issue.nb_comments} comment${
              issue.nb_comments === 1 ? '' : 's'
            }`}
          </span>
          <span className={b('infos')}>
            <Octicon name="repo" className="githubIcons" />
            {issue.repo_name}
            {isInEdition === 'labels' ? (
              <form
                id="updateLabelForm"
                onSubmit={e => {
                  e.preventDefault()
                  onUpdateIssueLabels(e, issue, options)
                  this.updateEditionStatus(null)
                }}
              >
                <LabelMultiSelect
                  closeOnSelect={false}
                  options={options}
                  removeSelected
                  value={issuesLabels}
                />
                <button type="submit">Update</button>
                <button
                  type="button"
                  onClick={() => this.updateEditionStatus(null)}
                >
                  Cancel
                </button>
              </form>
            ) : (
              <span className={b('labels')}>
                {issue.labels.length === 0 ? (
                  '· No Labels '
                ) : (
                  <span>
                    {issue.labels.map(label => (
                      <span key={label.label_name} className={b('label')}>
                        <span
                          className={b('bullet')}
                          style={{
                            backgroundColor: `#${label.label_color}`,
                          }}
                        />
                        {label.label_name}
                      </span>
                    ))}
                  </span>
                )}
                <span onClick={() => this.updateEditionStatus('labels')}>
                  <i className="fa fa-cog" />
                </span>
              </span>
            )}
          </span>
          <span className={b('infos')}>
            <br />
            <Octicon name="milestone" className="githubIcons" />
            {isInEdition === 'milestones' ? (
              <form
                id="updateMilestoneForm"
                onSubmit={e => {
                  e.preventDefault()
                  onUpdateIssue(
                    {
                      milestone:
                        e.target.milestone.value === ''
                          ? null
                          : e.target.milestone.value,
                    },
                    issue
                  )
                  this.updateEditionStatus(null)
                }}
              >
                <select
                  className={b('milestoneSelect')}
                  id="milestone"
                  name="milestone"
                  defaultValue={
                    issue.milestone_number ? issue.milestone_number : ''
                  }
                >
                  <option value="" />
                  {milestones.map(milestone => (
                    <option
                      key={milestone.milestone_id}
                      value={milestone.milestone_number}
                    >
                      {milestone.milestone_title}
                    </option>
                  ))}
                </select>
                <button type="submit">Update</button>
                <button
                  type="button"
                  onClick={() => this.updateEditionStatus(null)}
                >
                  Cancel
                </button>
              </form>
            ) : (
              <span>
                {issue.milestone_title
                  ? issue.milestone_title
                  : 'No milestone defined'}
                <span
                  onClick={() => {
                    this.updateEditionStatus('milestones')
                  }}
                >
                  <i className="fa fa-cog" />
                </span>
              </span>
            )}
          </span>
          {isInEdition === 'body' ? (
            <form
              onSubmit={e => {
                e.preventDefault()
                onUpdateIssue({ body: e.target.body.value }, issue)
                this.updateEditionStatus(null)
                updateMarkdown('')
              }}
            >
              <MarkdownEditor />
              <button type="submit">Update</button>
              <button
                type="button"
                onClick={() => this.updateEditionStatus(null)}
              >
                Cancel
              </button>
            </form>
          ) : (
            <div className={b('comment')}>
              <span className={b('infos')}>
                <img
                  className={b('avatar')}
                  src={issue.user.avatar_url}
                  alt="avatar"
                  title={issue.user.user_name}
                />{' '}
                {format(new Date(issue.updated_at), 'DD/MM/YYYY HH:mm:ss')}
                <span
                  onClick={() => {
                    this.updateEditionStatus('body')
                    updateMarkdown(issue.body)
                  }}
                >
                  <i className="fa fa-pencil faTop" title="edit body" />
                </span>
              </span>
              <ReactMarkdown
                className={b('commentDetail')}
                source={issue.body ? issue.body : 'No description provided.'}
              />
            </div>
          )}
          {issue.nb_comments > 0 &&
            issue.comments_expanded && (
              <div>
                {issue.comments.map(
                  comment =>
                    isInEdition === `comment|${comment.comment_id}` ? (
                      <form
                        key={comment.comment_id}
                        onSubmit={e => {
                          e.preventDefault()
                          onUpdateComment(
                            { body: e.target.body.value },
                            issue,
                            comment.comment_id
                          )
                          this.updateEditionStatus(null)
                          updateMarkdown('')
                        }}
                      >
                        <MarkdownEditor />
                        <button type="submit">Update</button>
                        <button
                          type="button"
                          onClick={() => this.updateEditionStatus(null)}
                        >
                          Cancel
                        </button>
                      </form>
                    ) : (
                      <div className={b('comment')} key={comment.comment_id}>
                        <span className={b('infos')}>
                          <img
                            key={comment.user.user_id}
                            className={b('avatar')}
                            src={comment.user.avatar_url}
                            alt="avatar"
                            title={comment.user.user_name}
                          />{' '}
                          {format(
                            new Date(comment.updated_at),
                            'DD/MM/YYYY HH:mm:ss'
                          )}
                          <span
                            onClick={() => {
                              this.updateEditionStatus(
                                `comment|${comment.comment_id}`
                              )
                              updateMarkdown(comment.body)
                            }}
                          >
                            <i
                              className="fa fa-pencil faTop"
                              title="edit body"
                            />
                          </span>
                        </span>
                        <ReactMarkdown
                          className={b('commentDetail')}
                          source={comment.body}
                        />
                      </div>
                    )
                )}
              </div>
            )}
        </span>
        {isInEdition === 'addComment' && (
          <span>
            <form
              onSubmit={e => {
                e.preventDefault()
                onUpdateComment({ body: e.target.body.value }, issue)
                this.updateEditionStatus(null)
                updateMarkdown('')
              }}
            >
              <MarkdownEditor />
              <button type="submit">Update</button>
              <button
                type="button"
                onClick={() => this.updateEditionStatus(null)}
              >
                Cancel
              </button>
            </form>
          </span>
        )}
        {isInEdition === null && (
          <span>
            <button
              type="submit"
              onClick={() => {
                updateMarkdown('')
                this.updateEditionStatus('addComment')
                if (!issue.comments_expanded) {
                  onToggleCommentsExpanded(issue)
                }
              }}
            >
              add a comment
            </button>
            {issue.nb_comments > 0 && (
              <span onClick={() => onToggleCommentsExpanded(issue)}>
                {issue.comments_expanded ? (
                  <button type="submit">hide comments</button>
                ) : (
                  <button type="submit">show comments</button>
                )}
              </span>
            )}
            <button
              type="submit"
              onClick={() =>
                onUpdateIssue(
                  { state: issue.state === 'open' ? 'closed' : 'open' },
                  issue
                )
              }
            >
              {issue.state === 'open' ? 'close issue' : 'reopen issue'}
            </button>
          </span>
        )}
      </section>
    )
  }
}
export default connect(
  state => ({
    currentIssue: state.issues.results.currentIssue,
    labels: state.labels.results,
    milestones: state.issueForm.results.milestonesSelect,
    roles: state.issueForm.results.rolesSelect,
  }),
  dispatch => ({
    getCircle: labelId => {
      const param = labelId === '' ? '' : `?label_id=${labelId}`
      dispatch(fetchCircle(param, true)).then(circle => {
        dispatch(changeRolesSelect(null, circle.roles))
      })
    },
    getMilestones: repoName => {
      dispatch(changeMilestoneSelect(repoName))
    },
    onToggleCommentsExpanded: issue => {
      dispatch(getAndToggleCommentsExpanded(issue))
    },
    onUpdateComment: (values, issue, commentId) => {
      dispatch(addOrUpdateComment(Object.assign({}, issue), values, commentId))
    },
    onUpdateIssue: (values, issue) => {
      dispatch(updateATicket(Object.assign({}, issue), values))
    },
    onUpdateIssueLabels: (event, issue, labels) => {
      let selectedLabels = []
      if (event.target.labelMultiSelect) {
        if (event.target.labelMultiSelect.length > 0) {
          for (let i = 0; i < event.target.labelMultiSelect.length; i++) {
            selectedLabels = updateLabelsList(
              +event.target.labelMultiSelect[i].value,
              labels,
              selectedLabels
            )
          }
        } else {
          selectedLabels = updateLabelsList(
            +event.target.labelMultiSelect.value,
            labels,
            selectedLabels
          )
        }
      }
      dispatch(updateATicket(issue, { labels: selectedLabels }))
    },
    updateMarkdown: value => {
      dispatch(checkMarkdown(value))
    },
  })
)(IssueDetail)
