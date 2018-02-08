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
      <span
        className={b({
          status: issue.state,
          'pull-request': issue.pull_request !== null,
        })}
      >
        <span className={b('title')}>
          {' '}
          <a href={issue.html_url} target="_blank">
            #{issue.ticket_number}
          </a>{' '}
          {issue.ticket_title}
          {issue.assignees.map(user => (
            <img
              key={user.user_id}
              className={b('avatar')}
              src={user.avatar_url}
              alt="avatar"
              title={user.user_name}
            />
          ))}
        </span>
        <span className={b('owner')}>
          {issue.user.user_name} opened this issue, last update:{' '}
          {format(new Date(issue.updated_at), 'DD/MM/YYYY HH:MM:ss')}
        </span>
        <br />
        <span className={b('infos')}>{issue.repo_name}</span>
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
                        'DD/MM/YYYY HH:MM:ss'
                      )}
                    </span>
                    <ReactMarkdown
                      className={b('commentDetail')}
                      source={comment.body}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <button type="submit">show comments</button>
            )}
          </div>
        )}
      </span>
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
