import React from 'react'
import { Helmet } from 'react-helmet'

import { connect } from '../utils'
import Loading from './Loading'
import { createCircle, deleteCircle, updateCircle } from '../actions'

function Organisation({ error, loading, onSubmit, circles, btnClick, onEdit }) {
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
            Nom :
            <input name="circle_name" required />
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
          <label> Roles : </label>
          <p>A VOIR APRES CRUD ROLE</p>
          <br />
          <input type="submit" value="Créer un cercle" />
        </form>
      </article>
      <article>
        <h2>LISTE DES CERCLES:</h2>
        {loading ? (
          ''
        ) : (
          <ul>
            {circles.map(circle => (
              <li key={circle.circle_id}>
                <b>{circle.circle_name}:</b>
                <br />
                -objectif: {circle.circle_purpose}
                <br />
                -domaine: {circle.circle_domain}
                <br />
                -redevabilités: {circle.circle_accountabilities}
                <br />
                <br />
                <button
                  onClick={e => {
                    // e.preventDefault()
                    btnClick(circle.circle_id)
                  }}
                >
                  Supprimer
                </button>
                <button>Créer les roles</button>
                <article>
                  <h2>MODIFIER CE CERCLE:</h2>
                  <form
                    onSubmit={e => {
                      onEdit(circle.circle_id, e)
                    }}
                  >
                    <label>
                      Nom :
                      <input
                        name="circle_name"
                        defaultValue={circle.circle_name}
                        required
                      />
                    </label>
                    <br />
                    <label>
                      Objectif :
                      <input
                        name="circle_purpose"
                        defaultValue={circle.circle_purpose}
                        required
                      />
                    </label>
                    <br />
                    <label>
                      Domaine :
                      <input
                        name="circle_domain"
                        defaultValue={circle.circle_domain}
                        required
                      />
                    </label>
                    <br />
                    <label>
                      Redevabilités :
                      <input
                        name="circle_accountabilities"
                        defaultValue={circle.circle_accountabilities}
                        required
                      />
                    </label>
                    <br />
                    <input type="submit" value="Modifier le cercle" />
                  </form>
                </article>
              </li>
            ))}
          </ul>
        )}
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
    btnClick: data => {
      return dispatch(deleteCircle(data))
    },
    onEdit: (id, e) => {
      // e.preventDefault()
      const formCircle = [].slice
        .call(e.target.elements)
        .reduce(function(map, obj) {
          if (obj.name) {
            map[obj.name] = obj.value
          }

          return map
        }, {})
      dispatch(updateCircle(id, formCircle))
    },
  })
)(Organisation)
