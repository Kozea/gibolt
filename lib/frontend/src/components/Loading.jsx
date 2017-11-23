import './Loading.sass'

import React from 'react'

import { block } from '../utils'

const b = block('Loading')

export default function Loading() {
  return (
    <div className={b()}>
      <div className={b('container')}>
        {[1, 2, 3, 4].map(i => <div key={i} className={b('box', { n: i })} />)}
      </div>
    </div>
  )
}
