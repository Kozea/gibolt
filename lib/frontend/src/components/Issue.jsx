import './Issue.sass'

import React from 'react'

import { block } from '../utils'

var ReactMarkdown = require('react-markdown')

const b = block('Issue')

export default function Issue(props) {
  return (
    <li
      className={b({
        status: props.state,
        'pull-request': props.pull_request !== void 0,
      })}
    >
      <input
        type="checkbox"
        checked={props.selected}
        onChange={props.onBoxChange}
      />
      {props.users.map(user => (
        <img
          key={user.id}
          className={b('avatar')}
          src={user.avatar_url}
          alt="avatar"
          title={user.login}
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
      {props.body && (
        <div onClick={props.onClick}>
          {props.expanded ? (
            <ReactMarkdown
              className={b('body').toString()}
              source={props.body}
            />
          ) : (
            <span>show body</span>
          )}
        </div>
      )}
    </li>
  )
}
