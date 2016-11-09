import React, { Component } from 'react'
import { block } from '../utils'
import './StatusItem.sass'


const b = block('StatusItem')
export default function StatusItem(props) {
  return (
    <li className={ b({active: props.active}) }>
      <a className={ b('link') } href={props.action}>{props.children}</a>
    </li>
  )
}
