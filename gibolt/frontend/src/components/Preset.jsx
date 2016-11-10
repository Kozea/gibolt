import React, { Component }  from 'react'
import { block } from '../utils'
import './Preset.sass'


const b = block('Preset')
export default function Preset(props) {
  return (
    <li className={ b('item', {active: props.active}) }>
      <span className={ b('link') } href={props.action} onClick={props.onLinkClick}>{props.children}</span>
    </li>
  )
}
