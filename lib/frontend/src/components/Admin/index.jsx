import './Admin.sass'

import React from 'react'
import { Helmet } from 'react-helmet'

import { block } from '../../utils'

const b = block('Admin')

export default function Admin() {
  return (
    <div className={b()}>
      <Helmet>
        <title>Gibolt - Admin</title>
      </Helmet>
    </div>
  )
}
