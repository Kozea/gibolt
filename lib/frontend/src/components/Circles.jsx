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

function Circles({ error, labels, loading, results, onSubmit }) {
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
        <article>
          <h2>CREER UN NOUVEAU CERCLE :</h2>
          <form onSubmit={e => onSubmit(e)}>
            <label>
              Nom :
              <input name="circle_name" required />
            </label>
            <br />
            <label>
              Id du parent :
              <input name="parent_circle_id" />
            </label>
            <br />
            <label>
              Objectif :
              <input name="circle_purpose" required />
            </label>
            <br />
            <label>
              Domaine :
              <input name="circle_domain" required />
            </label>
            <br />
            <label>
              Redevabilités :
              <br />
              <textarea
                name="circle_accountabilities"
                rows="5"
                cols="40"
                required
              />
            </label>
            <br />
            <input type="submit" value="Créer un cercle" />
          </form>
        </article>
        <button type="submit">Add a circle</button>
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
      // e.preventDefault()
      const formCircle = [].slice
        .call(e.target.elements)
        .reduce(function(map, obj) {
          if (obj.name) {
            map[obj.name] = obj.value
          }

          return map
        }, {})
      dispatch(createCircle(formCircle))
    },
    // btnClick: data => {
    //   return dispatch(deleteCircle(data))
    // },
    // onEdit: (id, e) => {
    //   const formCircle = [].slice
    //     .call(e.target.elements)
    //     .reduce(function(map, obj) {
    //       if (obj.name) {
    //         map[obj.name] = obj.value
    //       }
    //
    //       return map
    //     }, {})
    //   dispatch(updateCircle(id, formCircle))
    // },
  })
)(Circles)
