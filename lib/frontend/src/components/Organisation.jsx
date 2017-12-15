import React from 'react'
import { Helmet } from 'react-helmet'

import { connect } from '../utils'
import Loading from './Loading'
import { createCircle } from '../actions'

function Organisation({ error, loading, onSubmit }) {
  return (
    <div>
      <Helmet>
        <title>Gibolt - Organisation</title>
      </Helmet>
      {loading && <Loading />}
      {error && (
        <article>
          <h2>Error during circles fetch</h2>
          <code>{error}</code>
        </article>
      )}
      <article>
        <h2>CREER UN NOUVEAU CERCLE :</h2>
        <form onSubmit={e => onSubmit(e)}>
          <label>
            Nom
            <input name="circle_name" required />
          </label>
          <label>
            Objectif
            <input name="circle_purpose" required />
          </label>
          <label>
            Domaine
            <input name="circle_domain" required />
          </label>
          <label>
            Redevabilités
            <input name="circle_accountabilities" required />
          </label>
          <input type="submit" value="Créer un cercle" />
        </form>
      </article>
    </div>
  )
}
export default connect(
  state => ({
    circles: state.organisation.results,
    loading: state.organisation.loading,
    error: state.organisation.error,
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
  })
)(Organisation)
