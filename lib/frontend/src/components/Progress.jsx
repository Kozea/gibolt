import './Progress.sass'

import block from 'bemboo'
import React from 'react'

const b = block('Progress')

export default function Progress({ val, total }) {
  total = total || 1
  const disp = `${Math.round((100 * val) / total).toFixed()}%`
  return (
    <span className={b}>
      <progress
        className={b.e('bar')}
        value={val / total}
        title={`${val} / ${total} - ${disp}`}
      >
        {disp}
      </progress>
      <span className={b.e('status')}>{disp}</span>
    </span>
  )
}
