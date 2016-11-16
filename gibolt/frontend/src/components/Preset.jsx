import React, { Component }  from 'react'
import { Link }  from 'redux-little-router'
import { block } from '../utils'
import './Preset.sass'


const b = block('Preset')
export default function Preset({ active, action, children, onLinkClick }) {
  return (
    <li className={ b('item', { active: active }) }>
      <Link className={ b('link') } href={ action }>{ children }</Link>
    </li>
  )
}
