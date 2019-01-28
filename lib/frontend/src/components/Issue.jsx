import './Issue.sass'

import block from 'bemboo'
import React from 'react'

const b = block('Issue')

export default function Issue(props) {
  return (
    <li
      className={b.m({
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
          className={b.e('avatar')}
          src={user.avatar_url}
          alt="avatar"
          title={user.user_name}
        />
      ))}
      <span className={b.e('link')} onClick={props.onModalDisplay}>
        <span className={b.e('title')}>{props.title}</span>
        <span className={b.e('id')}>#{props.id}</span>
        <span className={b.e('project')}>{props.project}</span>
        {props.labels.map(label => (
          <span key={label.label_name} className={b.e('label')}>
            <span
              className={b.e('bullet')}
              style={{ backgroundColor: `#${label.label_color}` }}
            />
            {label.label_name}
          </span>
        ))}
      </span>
      <div>
        <a
          className={b.e('view')}
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
