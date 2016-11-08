import React, { Component } from 'react'
import { pacomo } from '../utils'
import './Issue.sass'


export default pacomo.transformer(
  function Issue(props) {
    return (
      <li className={props.status}>
        <input type="checkbox" />
        <img className="avatar" src={ props.avatar } alt="avatar" title={ props.user } />
        <a className="link" href={ props.href }>
          <span className="title">{ props.title }</span>
          <span className="id">{ props.id }</span>
          <span className="project">{ props.project }</span>
          {
            props.labels.map((label) => (
              <span key={ label.text } className="label">
                <span className="bullet" style={ {backgroundColor: label.color} } />
                { label.text }
              </span>
            ))
          }
        </a>
      </li>
    )
  }
)
