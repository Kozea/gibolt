import './Loading.sass'

import block from 'bemboo'
import React from 'react'

const b = block('Loading')

export default function Loading() {
  return (
    <div className={b}>
      <div className={b.e('container')}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={b.e('box').m({ n: i })} />
        ))}
      </div>
    </div>
  )
}
