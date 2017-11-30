import './NotFound.sass'

import React from 'react'
import { Helmet } from 'react-helmet'
import { NotFound as HttpNotFound } from 'redux-http-status'

import { block } from '../utils'

const b = block('NotFound')

export default function NotFound() {
  return (
    <HttpNotFound>
      <Helmet>
        <title>Gibolt - 404</title>
      </Helmet>
      <section className={b()}>
        <div className={b('sadness')}>&gt; &lt;</div>
        <div className={b('bottom-line')}>You lost yourself in the gibolt.</div>
      </section>
    </HttpNotFound>
  )
}
