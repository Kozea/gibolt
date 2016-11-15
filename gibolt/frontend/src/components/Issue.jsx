import React, { Component } from 'react'
import { block } from '../utils'
import './Issue.sass'


const b = block('Issue')
export default function Issue(props) {
  return (
    <li className={ b({status: props.state}) }>
      <input type="checkbox" checked={ props.selected } onChange={props.onBoxChange}/>
      {props.users.map((user) =>
        <img key={ user.id } className={ b('avatar') } src={ user.avatar_url } alt="avatar" title={ user.login } />
      )}
      <a className={ b('link') } href={ props.url }>
        <span className={ b('title') }>{ props.title }</span>
        <span className={ b('id') }>#{ props.id }</span>
        <span className={ b('project') }>{ props.project }</span>
        {
          props.labels.map((label) => (
            <span key={ label.name } className={ b('label') }>
              <span className={ b('bullet') } style={ {backgroundColor: '#'+label.color} } />
              { label.name }
            </span>
          ))
        }
      </a>
    </li>
  )
}
