import './IssueDetail.sass'

import { format } from 'date-fns'
import React from 'react'

import {
  getAndToggleCommentsExpanded,
  updateIssueLabels,
} from '../actions/issues'
import { block, connect } from '../utils'
import LabelMultiSelect from './LabelMultiSelect'

const b = block('IssueDetail')
var ReactMarkdown = require('react-markdown')

class IssueDetail extends React.Component {
  constructor(props, context) {
    super(props, context)
    this.state = {
      isInEdition: false,
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
          <span className={b('ttl')}>
            {' '}
            <a href={issue.html_url} target="_blank">
              #{issue.ticket_number}
            </a>{' '}
            {isInEdition ? (
              <form>
                <input defaultValue={issue.ticket_title} />
              </form>
            ) : (
              <span className={b('title')}>{issue.ticket_title}</span>
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
            <span onClick={() => this.updateEditionStatus(true)}>
              <i className="fa fa-edit" />
            </span>
          </span>
          <span className={b('owner')}>
            {issue.user.user_name} opened this issue, last update:{' '}
            {format(new Date(issue.updated_at), 'DD/MM/YYYY HH:mm:ss')}
          </span>
          <br />
          <span className={b('infos')}>
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
          {issue.body && (
            <div className={b('content')}>
              <ReactMarkdown
                className={b('body').toString()}
                source={issue.body}
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
          <button type="submit" onClick={onModalClose}>
            Close
          </button>
        </span>
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
      dispatch(updateIssueLabels(selectedLabels, issue))
    },
  })
)(IssueDetail)
