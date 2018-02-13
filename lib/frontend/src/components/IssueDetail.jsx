import './IssueDetail.sass'

import { format } from 'date-fns'
import React from 'react'
import Octicon from 'react-component-octicons'

import { getAndToggleCommentsExpanded, updateATicket } from '../actions/issues'
import { block, connect } from '../utils'
import IssueStatusIcon from './Utils/IssueStatusIcon'
import LabelMultiSelect from './Utils/LabelMultiSelect'

const b = block('IssueDetail')
var ReactMarkdown = require('react-markdown')

class IssueDetail extends React.Component {
  constructor(props, context) {
    super(props, context)
    this.state = {
      isInEdition: null,
      areLabelsInEdtion: false,
    }
  }

  updateEditionStatus(value) {
    this.setState({
      isInEdition: value,
    })
  }

  updateLabelsEditionStatus(value) {
    this.setState({
      areLabelsInEdtion: value,
    })
  }

  render() {
    const {
      issue,
      labels,
      onModalClose,
      onToggleCommentsExpanded,
      onUpdateIssue,
      onUpdateIssueLabels,
    } = this.props
    const { areLabelsInEdtion, isInEdition } = this.state
    const options = []
    const issuesLabels = []
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
        }
      })
    )
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
                  className="Title"
                />
                <button type="submit">Update</button>
                <button
                  type="submit"
                  onClick={() => this.updateEditionStatus(null)}
                >
                  Cancel
                </button>
              </form>
            ) : (
              <span className={b('title')}>
                {issue.ticket_title}{' '}
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
            {areLabelsInEdtion ? (
              <form
                id="updateLabelForm"
                onSubmit={e => {
                  e.preventDefault()
                  onUpdateIssueLabels(e, issue, options)
                  this.updateLabelsEditionStatus(false)
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
                  type="submit"
                  onClick={() => this.updateLabelsEditionStatus(false)}
                >
                  Cancel
                </button>
              </form>
            ) : (
              <span>
                {issue.labels.length === 0 ? (
                  ' - No Labels '
                ) : (
                  <span>
                    {issue.labels.map(label => (
                      <span key={label.label_name} className={b('label')}>
                        <span
                          className={b('bullet')}
                          style={{ backgroundColor: `#${label.label_color}` }}
                        />
                        {label.label_name}
                      </span>
                    ))}
                  </span>
                )}
                <span onClick={() => this.updateLabelsEditionStatus(true)}>
                  <i className="fa fa-cog" />
                </span>
              </span>
            )}
          </span>
          <span className={b('infos')}>
            <br />
            <Octicon name="milestone" className="githubIcons" />
            {issue.milestone_title
              ? issue.milestone_title
              : 'No milestone defined'}
            <i className="fa fa-cog" />
          </span>
          {isInEdition === 'body' ? (
            <form
              onSubmit={e => {
                e.preventDefault()
                onUpdateIssue({ body: e.target.bodyInput.value }, issue)
                this.updateEditionStatus(null)
              }}
            >
              <input
                name="bodyInput"
                defaultValue={issue.body}
                className="Title"
              />
              <button type="submit">Update</button>
              <button
                type="submit"
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
                <span onClick={() => this.updateEditionStatus('body')}>
                  <i className="fa fa-pencil faTop" title="edit body" />
                </span>
              </span>
              <ReactMarkdown
                className={b('commentDetail')}
                source={issue.body ? issue.body : 'No description provided.'}
              />
            </div>
          )}
          {issue.nb_comments > 0 && (
            <div onClick={() => onToggleCommentsExpanded(issue)}>
              {issue.comments_expanded ? (
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
                  <button type="submit">hide comments</button>
                </div>
              ) : (
                <button type="submit">show comments</button>
              )}
            </div>
          )}
        </span>
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
      </section>
    )
  }
}
export default connect(
  state => ({
    labels: state.labels.results,
  }),
  dispatch => ({
    onToggleCommentsExpanded: issue => {
      dispatch(getAndToggleCommentsExpanded(issue))
    },
    onUpdateIssue: (values, issue) => {
      dispatch(updateATicket(issue, values))
    },
    onUpdateIssueLabels: (event, issue, labels) => {
      const selectedLabels = []
      for (let i = 0; i < event.target.labelMultiSelect.length; i++) {
        const selectedLabel = labels
          .filter(lab => lab.value === +event.target.labelMultiSelect[i].value)
          .map(lab => ({
            label_name: lab.label,
            label_color: lab.color,
          }))
        if (selectedLabel[0]) {
          selectedLabels.push(selectedLabel[0])
        }
      }
      dispatch(updateATicket(issue, { labels: selectedLabels }))
    },
  })
)(IssueDetail)
