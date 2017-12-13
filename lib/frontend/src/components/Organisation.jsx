import React from 'react'
import { Helmet } from 'react-helmet'

import { connect } from '../utils'
// import Loading from './Loading'
import { createCircle } from '../actions'

function Organisation(loading, error, circles, onCreateCircle) {
  return (
    <div>
      <Helmet>
        <title>Gibolt - Organisation</title>
      </Helmet>
      {/* {loading && <Loading />} */}
      {/* Cercles existants:
      {circles.map(circle => (
        <li key={circle.circle_id}>{circle.circle_name}</li>
      ))} */}
      {/* {error && (
        <article>
          <h2>Error during circles fetch</h2>
          <code>{error}</code>
        </article>
      )} */}
      {/* {circles.map(circle => (
        <li key={circle.circle_id}> */}
      <form
        onSubmit={e => {
          e.preventDefault()
          onCreateCircle(
            e.target.name.value,
            e.target.purpose.value,
            e.target.domain.value,
            e.target.accountabilities.value
          )
        }}
      >
        <label>Nom du cercle:</label>
        <input required name="name" />
        <br />
        <br />
        <label>Objectif(s):</label>
        <input required name="purpose" />
        <br />
        <br />
        <label>Domaine:</label>
        <input required name="domain" />
        <br />
        <br />
        <label>Redevabilités:</label>
        <input required name="accountabilities" />
        <br />
        <br />
        <button type="submit">Créer un cercle</button>
      </form>
      {/* </li>
      ))} */}
      {(console.log('circles'), console.log(circles))}
    </div>
  )
}
export default connect(
  state => ({
    circles: state.organisation.results.circles,
    loading: state.organisation.loading,
    error: state.organisation.error,
  }),
  dispatch => ({
    onCreateCircle: (name, purpose, domain, accountabilities) => {
      dispatch(createCircle(name, purpose, domain, accountabilities))
    },
  })
)(Organisation)
