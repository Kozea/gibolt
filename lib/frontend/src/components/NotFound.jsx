import './NotFound.sass'

import block from 'bemboo'
import React from 'react'
import { Helmet } from 'react-helmet'

const b = block('NotFound')

export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>Gibolt - 404</title>
      </Helmet>
      <section className={b}>
        <div className={b.e('sadness')}>&gt; &lt;</div>
        <div className={b.e('bottom-line')}>
          You lost yourself in the gibolt.
        </div>
      </section>
    </>
  )
}
