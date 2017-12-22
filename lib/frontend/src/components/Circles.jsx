import './Circles.sass'

import { stringify } from 'query-string'
import React from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'

import { block, connect, sortGroupCircles } from '../utils'
import { createCircle } from '../actions/circle'
import Loading from './Loading'

const b = block('Circles')

function getColor(label, circle) {
  if (circle.circle_name.toLowerCase() === label.text.toLowerCase()) {
    return label
  }
}

function Circles({ error, labels, loading, results }) {
  const circles = sortGroupCircles(results)

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
        {circles.length > 0 ? (
          <ul>
            {circles.map(circle => (
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
                  <span className={b('unlink')}>
                    {circle.parent_circle_name ? ' > ' : ''}
                  </span>
                  {circle.circle_name}
                  <span className={b('unlink')}>
                    {circle.parent_circle_name
                      ? ` (sous-cercle de "${circle.parent_circle_name}")`
                      : ''}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <span>No circles defined</span>
        )}
        <Link
          to={{
            pathname: '/createcircle',
          }}
        >
          <button type="submit">Add a circle</button>
        </Link>
      </article>
    </section>
  )
}
export default connect(
  state => ({
    results: state.circles.results,
    loading: state.circles.loading,
    error: state.circles.errors,
    labels: state.labels.results.qualifier,
  }),
  dispatch => ({
    onSubmit: e => {
      const formCircle = [].slice
        .call(e.target.elements)
        .reduce(function(map, obj) {
          if (obj.name && obj.value) {
            map[obj.name] = obj.value
          }

          return map
        }, {})
      dispatch(createCircle(formCircle))
    },
  })
)(Circles)
