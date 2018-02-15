import './IssueDetail.sass'

import { format } from 'date-fns'
import React from 'react'
import Octicon from 'react-component-octicons'

import { checkMarkdown } from '../actions'
import { fetchCircle } from '../actions/circle'
import { changeMilestoneSelect } from '../actions/issueForm'
import { getAndToggleCommentsExpanded, updateATicket } from '../actions/issues'
import { block, connect } from '../utils'
import IssueStatusIcon from './Utils/IssueStatusIcon'
import LabelMultiSelect from './Utils/LabelMultiSelect'
import MarkdownEditor from './Utils/MarkdownEditor'

const b = block('IssueDetail')
var ReactMarkdown = require('react-markdown')

function updateLabelsList(label, labels, selectedLabels) {
  const selectedLabel = labels.filter(lab => lab.value === label).map(lab => ({
    label_name: lab.label,
    label_color: lab.color,
  }))
  if (selectedLabel[0]) {
    selectedLabels.push(selectedLabel[0])
  }
  return selectedLabels
}

class IssueDetail extends React.Component {
  constructor(props, context) {
    super(props, context)
    this.state = {
      isInEdition: null,
      areLabelsInEdtion: false,
    }
    this.props.getMilestones(this.props.issue.repo_name)
  }

  updateEditionStatus(value) {
    this.setState({
      isInEdition: value,
    })
  }

  render() {
    const {
      getCircle,
      labels,
      milestones,
      onModalClose,
      onToggleCommentsExpanded,
      onUpdateIssue,
      onUpdateIssueLabels,
      updateMarkdown,
    } = this.props
    const { isInEdition } = this.state
    const issue = this.props.issue ? this.props.issue : this.props.currentIssue
    const options = []
    const issuesLabels = []
    let assignedToCircle = ''
    Object.keys(labels).map(key =>
      labels[key].map(label => {
        options.push({
          color: label.color,
          label: label.text,
          type: key,
          value: label.label_id,
          disabled: false,
        })
        if (issue.labels.find(x => x.label_name === label.text)) {
          issuesLabels.push({
            color: label.color,
            label: label.text,
            type: key,
            value: label.label_id,
          })
          if (key === 'circle') {
            assignedToCircle = label.label_id
          }
        }
      })
    )
    if (assignedToCircle !== '') {
      getCircle(assignedToCircle)
    }
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
            {issue.assignees.map(user => (
              <img
                key={user.user_id}
                className={b('avatar')}
                src={user.avatar_url}
                alt="avatar"
                title={user.user_name}
              />
            ))}
            <i className="fa fa-user faTop" title="modify assignees" />
          </span>
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
                {issue.comments.map(comment => (
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
                    </span>
                    <ReactMarkdown
                      className={b('commentDetail')}
                      source={comment.body}
                    />
                  </div>
                ))}
              </div>
            )}
        </span>
        {isInEdition === null && (
          <span>
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
    labels: state.labels.results,
    milestones: state.issueForm.results.milestonesSelect,
    currentIssue: state.issues.results.currentIssue,
  }),
  dispatch => ({
    getCircle: labelId => {
      const param = `?label_id=${labelId}`
      const fetchOnlyCircle = true
      dispatch(fetchCircle(param, fetchOnlyCircle))
    },
    getMilestones: repoName => {
      dispatch(changeMilestoneSelect(repoName))
    },
    onToggleCommentsExpanded: issue => {
      dispatch(getAndToggleCommentsExpanded(issue))
    },
    onUpdateIssue: (values, issue) => {
      dispatch(updateATicket(issue, values))
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
