import './Issue.sass'

import React from 'react'

import { block } from '../utils'

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
      <span className={b('link')} onClick={props.onModalDisplay}>
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
      </span>
      <div>
        <a
          className={b('view')}
          href={props.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          view on GitHub
        </a>
      </div>
    </li>
  )
}
