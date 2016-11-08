import React, { Component } from 'react'
import { pacomo } from '../utils'
import './FilterItem.sass'


export default pacomo.transformer(
  function FilterItem(props) {
    return (
      <li className={props.active ? 'active' : ''}>
        <a className="link" href={props.label}>
          <div className="bullet" style={{backgroundColor: props.color}} />
          {props.label}
        </a>
      </li>
    )
  }
)
