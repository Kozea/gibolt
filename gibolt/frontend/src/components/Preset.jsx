import React, { Component }  from 'react'
import { block } from '../utils'
import './Preset.sass'


const b = block('Preset')
export default function Preset(props) {
  return (
    <li className={ b('item', {active: props.active}) }>
      <a className={ b('link') } href={props.action}>{props.children}</a>
    </li>
  )
}
