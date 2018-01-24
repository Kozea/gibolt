import './Admin.sass'

import React from 'react'
import { Helmet } from 'react-helmet'

import { block } from '../../utils'
import AdminLabels from './AdminLabels'

const b = block('Admin')

export default function Admin() {
  return (
    <section className={b()}>
      <Helmet>
        <title>Gibolt - Admin</title>
      </Helmet>
      <article>
        <h2>Administration</h2>
        <AdminLabels />
      </article>
    </section>
  )
}
