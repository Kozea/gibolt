import './AdminMenu.sass'

import React from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'

import { block } from '../../utils'

const b = block('AdminMenu')

export default function AdminMenu() {
  return (
    <section className={b()}>
      <Helmet>
        <title>Gibolt - Admin</title>
      </Helmet>
      <article className={b('adminMenu')}>
        <h2>Administration</h2>
        <ul>
          <li className={b('item')}>
            <Link
              className={b('link')}
              to={{
                pathname: '/admin/labels',
              }}
            >
              Labels
            </Link>
          </li>
          <li className={b('item')}>
            <Link
              className={b('link')}
              to={{
                pathname: '/admin/repositories',
              }}
            >
              Repositories
            </Link>
          </li>
        </ul>
      </article>
    </section>
  )
}
