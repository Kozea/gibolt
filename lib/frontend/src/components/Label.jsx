import './Label.sass'

import block from 'bemboo'
import React from 'react'
import { Link } from 'react-router-dom'

const b = block('Label')

export default function Label({ action, active, label, color }) {
  const removeModifiers = e => {
    e.shiftKey = e.altKey = e.ctrlKey = false
  }
  return (
    <li className={b.e('item').m(active)}>
      <Link className={b.e('link')} to={action} onClick={removeModifiers}>
        <span className={b.e('bullet')} style={{ backgroundColor: color }} />
        {label}
      </Link>
    </li>
  )
}
