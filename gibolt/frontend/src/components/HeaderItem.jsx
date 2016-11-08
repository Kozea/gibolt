import React, { Component } from 'react'
import { pacomo } from '../utils'
import './HeaderItem.sass'


export default pacomo.transformer(
  function HeaderItem(props) {
    return (
      <li className={props.active ? 'active' : ''}>
        <a className="link" href={props.action}>{props.children}</a>
      </li>
    )
  }
)
