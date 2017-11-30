import './Repositories.sass'

import { stringify } from 'query-string'
import React from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'

import { block, connect } from '../utils'
import Loading from './Loading'

const b = block('Repositories')

function Repositories({ loading, error, repositories }) {
  return (
    <section className={b()}>
      <Helmet>
        <title>Gibolt - Repositories</title>
      </Helmet>
      <h1 className={b('head')}>Repositories</h1>
      {loading && <Loading />}
      {error && (
        <article className={b('date', { error: true })}>
          <h2>Error during report fetch</h2>
          <code>{error}</code>
        </article>
      )}
      <article className={b('repositories')}>
        <ul>
          {repositories.map(repository => (
            <li key={repository} className={b('item')}>
              <Link
                className={b('link')}
                to={{
                  pathname: '/repository',
                  search: stringify({ name: repository }),
                }}
              >
                {repository}
              </Link>
            </li>
          ))}
        </ul>
      </article>
    </section>
  )
}
export default connect(state => ({
  repositories: state.repositories.results.repositories,
  loading: state.repositories.loading,
  error: state.repositories.error,
}))(Repositories)
