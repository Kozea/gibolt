import './Circles.sass'

import React from 'react'
import { Helmet } from 'react-helmet'

import { block, connect } from '../utils'
import Loading from './Loading'

const b = block('Circles')

function Circles({ error, loading, results }) {
  return (
    <section className={b()}>
      <Helmet>
        <title>Gibolt - Circles</title>
      </Helmet>
      {error && (
        <article className={b('group', { error: true })}>
          <h2>Error during issue fetch</h2>
          <code>{error}</code>
        </article>
      )}
      {loading && <Loading />}
      <article className={b('circles')}>
        <h2>Circles</h2>
        <ul>
          {results.map(circle => (
            <li key={circle.circle_id} className={b('item')}>
              <span className={b('bullet')} />
              {circle.circle_name}
            </li>
          ))}
        </ul>
      </article>
    </section>
  )
}
export default connect(state => ({
  results: state.circles.results,
  loading: state.circles.loading,
  error: state.circles.errors,
}))(Circles)
