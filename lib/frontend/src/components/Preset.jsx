import './Preset.sass'

import block from 'bemboo'
import React from 'react'
import { Link } from 'react-router-dom'

const b = block('Preset')

export default function Preset({ active, action, children }) {
  return (
    <li className={b.e('item').m({ active })}>
      <Link className={b.e('link')} to={action}>
        {children}
      </Link>
    </li>
  )
}
