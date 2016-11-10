import React, { Component } from 'react'
import { block } from '../utils'
import './Issue.sass'


const b = block('Issue')
export default function Issue(props) {
  return (
    <li className={ b({status: props.state}) }>
      <input type="checkbox" />
      {props.users.map((user) =>
        <img key={ user.name } className={ b('avatar') } src={ user.avatar } alt="avatar" title={ user.name } />
      )}
      <a className={ b('link') } href={ props.href }>
        <span className={ b('title') }>{ props.title }</span>
        <span className={ b('id') }>{ props.id }</span>
        <span className={ b('project') }>{ props.project }</span>
        {
          props.labels.map((label) => (
            <span key={ label.text } className={ b('label') }>
              <span className={ b('bullet') } style={ {backgroundColor: label.color} } />
              { label.text }
            </span>
          ))
        }
      </a>
    </li>
  )
}
