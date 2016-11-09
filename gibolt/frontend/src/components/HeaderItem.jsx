import React, { Component }  from 'react'
import { block } from '../utils'
import './HeaderItem.sass'


const b = block('HeaderItem')
export default function HeaderItem(props) {
  return (
    <li className={ b('item', {active: props.active}) }>
      <a className={ b('link') } href={props.action}>{props.children}</a>
    </li>
  )
}
