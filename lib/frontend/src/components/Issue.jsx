import './Issue.sass'

import React from 'react'
import { format } from 'date-fns'

import { block } from '../utils'

var ReactMarkdown = require('react-markdown')

const b = block('Issue')

export default function Issue(props) {
  return (
    <li
      className={b({
        status: props.state,
        'pull-request': props.pull_request !== null,
      })}
    >
      <input
        type="checkbox"
        checked={props.selected}
        onChange={props.onBoxChange}
      />
      {props.users.map(user => (
        <img
          key={user.user_id}
          className={b('avatar')}
          src={user.avatar_url}
          alt="avatar"
          title={user.user_name}
        />
      ))}
      <a className={b('link')} href={props.url}>
        <span className={b('title')}>{props.title}</span>
        <span className={b('id')}>#{props.id}</span>
        <span className={b('project')}>{props.project}</span>
        {props.labels.map(label => (
          <span key={label.label_name} className={b('label')}>
            <span
              className={b('bullet')}
              style={{ backgroundColor: `#${label.label_color}` }}
            />
            {label.label_name}
          </span>
        ))}
      </a>
      <div>
        {props.body && (
          <div onClick={props.onClick}>
            {props.expanded ? (
              <div>
                <ReactMarkdown
                  className={b('body').toString()}
                  source={props.body}
                />
              </div>
            ) : (
              <span>show body</span>
            )}
          </div>
        )}
        {props.nb_comments > 0 && (
          <div onClick={props.onClickComments}>
            {props.comments_expanded ? (
              <div>
                {props.comments.map(comment => (
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
      </div>
    </li>
  )
}
