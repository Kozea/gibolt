import React, { Component } from 'react'
import { block } from '../utils'
import './FilterItem.sass'


const b = block('FilterItem')
export default function FilterItem(props) {
  return (
    <li className={ b('item', {active: props.active}) }>
      <a className={ b('link') } href={ props.label }>
        <span className={ b('bullet') } style={ {backgroundColor: props.color} } />
        { props.label }
      </a>
    </li>
  )
}
