import './Label.sass'

import React from 'react'
import { Link } from 'react-router-dom'

import { block } from '../utils'

const b = block('Label')

export default function Label({ action, active, label, color }) {
  const removeModifiers = e => {
    e.shiftKey = e.altKey = e.ctrlKey = false
  }
  return (
    <li className={b('item', active)}>
      <Link className={b('link')} to={action} onClick={removeModifiers}>
        <span className={b('bullet')} style={{ backgroundColor: color }} />
        {label}
      </Link>
    </li>
  )
}
