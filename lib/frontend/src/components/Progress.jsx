import './Progress.sass'

import React from 'react'

import { block } from '../utils'

const b = block('Progress')

export default function Progress({ val, total }) {
  total = total || 1
  const disp = `${Math.round(100 * val / total).toFixed()}%`
  return (
    <span className={b()}>
      <progress
        className={b('bar')}
        value={val / total}
        title={`${val} / ${total} - ${disp}`}
      >
        {disp}
      </progress>
      <span className={b('status')}>{disp}</span>
    </span>
  )
}
