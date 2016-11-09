import React, { Component } from 'react'
import { block } from '../utils'
import './Issue.sass'


const b = block('Issue')
export default function Issue(props) {
  return (
    <li className={ b({status: props.status}) }>
      <input type="checkbox" />
      <img className={ b('avatar') } src={ props.avatar } alt="avatar" title={ props.user } />
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
