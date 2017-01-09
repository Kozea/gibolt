import React, { Component } from 'react'
import { Link }  from 'redux-little-router'
import { block } from '../utils'
import './Label.sass'


const b = block('Label')
export default function Label({ action, active, label, color, onClick}) {
  const removeModifiers = e => {
    e.shiftKey = e.altKey = e.ctrlKey = false
  }
  return (
    <li className={ b('item', active) }>
      <Link className={ b('link') } href={ action } onClick={ removeModifiers }>
        <span className={ b('bullet') } style={{ backgroundColor: color }}/>
        { label }
      </Link>
    </li>
  )
}
