import './AdminMenu.sass'

import block from 'bemboo'
import React from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'

const b = block('AdminMenu')

export default function AdminMenu() {
  return (
    <section className={b}>
      <Helmet>
        <title>Gibolt - Admin</title>
      </Helmet>
      <article className={b.e('adminMenu')}>
        <h2>Administration</h2>
        <ul>
          <li className={b.e('item')}>
            <Link
              className={b.e('link')}
              to={{
                pathname: '/admin/labels',
              }}
            >
              Labels
            </Link>
          </li>
          <li className={b.e('item')}>
            <Link
              className={b.e('link')}
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
