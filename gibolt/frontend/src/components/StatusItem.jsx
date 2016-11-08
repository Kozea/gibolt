import React, { Component } from 'react'
import { pacomo } from '../utils'
import './StatusItem.sass'


export default pacomo.transformer(
  function StatusItem(props) {
    return (
      <li className={props.active ? 'active' : ''}>
        <a className="link" href={props.action}>{props.children}</a>
      </li>
    )
  }
)
