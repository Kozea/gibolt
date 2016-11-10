import React, { Component } from 'react'
import { block } from '../utils'
import './StatusItem.sass'


const b = block('StatusItem')
export default function StatusItem(props) {
  return (
    <li className={ b({active: props.active}) }>
      <span className={ b('link') } href={props.action} onClick={props.onLinkClick} >{props.children}</span>
    </li>
  )
}
