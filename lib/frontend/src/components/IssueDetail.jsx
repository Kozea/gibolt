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
      <h2>{issue.ticket_title}</h2>
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
