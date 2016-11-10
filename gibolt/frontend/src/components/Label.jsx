import React, { Component } from 'react'
import { block } from '../utils'
import './Label.sass'


const b = block('Label')
export default function Label({ active, label, color, onClick}) {
  return (
    <li className={ b('item', {active: active}) }>
      <span className={ b('link') } href={ label } onClick={ onClick }>
        <span className={ b('bullet') } style={ {backgroundColor: color} } />
        { label }
      </span>
    </li>
  )
}
