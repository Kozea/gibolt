import './IssueDetail.sass'

import React from 'react'
import { format } from 'date-fns'

import { getAndToggleCommentsExpanded } from '../actions/issues'
import { block, connect } from '../utils'

const b = block('IssueDetail')
var ReactMarkdown = require('react-markdown')

function IssueDetail(props) {
  const { issue, onToggleCommentsExpanded } = props
  return (
    <section className={b()}>
      <span className={b('title')}>
        {' '}
        {issue.assignees.map(user => (
          <img
            key={user.user_id}
            className={b('avatar')}
            src={user.avatar_url}
            alt="avatar"
            title={user.user_name}
          />
        ))}
        {issue.ticket_title}
      </span>
      <span className={b('infos')}>
        #{issue.ticket_number} {issue.repo_name}
      </span>
      {issue.labels.map(label => (
        <span key={label.label_name} className={b('label')}>
          <span
            className={b('bullet')}
            style={{ backgroundColor: `#${label.label_color}` }}
          />
          {label.label_name}
        </span>
      ))}
      {issue.body && (
        <div>
          <ReactMarkdown className={b('body').toString()} source={issue.body} />
        </div>
      )}
      {issue.nb_comments > 0 && (
        <div onClick={() => onToggleCommentsExpanded(issue)}>
          {issue.comments_expanded ? (
            <div>
              {issue.comments.map(comment => (
                <div key={comment.comment_id}>
                  <hr />
                  <img
                    key={comment.user.user_id}
                    className={b('avatar')}
                    src={comment.user.avatar_url}
                    alt="avatar"
                    title={comment.user.user_name}
                  />{' '}
                  <span className={b('day')}>
                    {format(
                      new Date(comment.updated_at),
                      'DD/MM/YYYY HH:MM:ss'
                    )}
                  </span>
                  <ReactMarkdown
                    className={b('comments').toString()}
                    source={comment.body}
                  />
                </div>
              ))}
            </div>
          ) : (
            <span>show comments</span>
          )}
        </div>
      )}
    </section>
  )
}
export default connect(
  () => ({}),
  dispatch => ({
    onToggleCommentsExpanded: issue => {
      dispatch(getAndToggleCommentsExpanded(issue))
    },
  })
)(IssueDetail)
