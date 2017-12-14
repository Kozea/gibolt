import './Circles.sass'

import { stringify } from 'query-string'
import React from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'

import { block, connect } from '../utils'
import Loading from './Loading'

const b = block('Circles')

function getColor(label, circle) {
  if (circle.circle_name.toLowerCase() === label.text.toLowerCase()) {
    return label
  }
}

function Circles({ error, labels, loading, results }) {
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
        {results.length > 0 ? (
          <ul>
            {results.map(circle => (
              <li
                key={circle.circle_id}
                className={b('item')}
                style={{
                  color: `${labels
                    .filter(label => getColor(label, circle))
                    .map(label => label.color)
                    .toString()}`,
                }}
              >
                <Link
                  className={b('link')}
                  to={{
                    pathname: '/circle',
                    search: stringify({ name: circle.circle_name }),
                  }}
                >
                  {circle.circle_name}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <span>No circles defined</span>
        )}
      </article>
    </section>
  )
}
export default connect(state => ({
  results: state.circles.results,
  loading: state.circles.loading,
  error: state.circles.errors,
  labels: state.labels.results.qualifier,
}))(Circles)
