import React, { Component } from 'react'
import { Link }  from 'redux-little-router'
import { block } from '../utils'
import './Label.sass'


const b = block('Label')
export default function Label({ action, active, label, color, onClick}) {
  return (
    <li className={ b('item', { active: active }) }>
      <Link className={ b('link') } href={ action } >
        <span className={ b('bullet') } style={{ backgroundColor: color }}/>
        { label }
      </Link>
    </li>
  )
}
