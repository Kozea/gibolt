import React from 'react'
import { Helmet } from 'react-helmet'

import { connect } from '../utils'
// import Loading from './Loading'
import { createCircle } from '../actions'

function Organisation(loading, error, circles, onSubmit) {
  return (
    <div>
      <Helmet>
        <title>Gibolt - Organisation</title>
      </Helmet>
      {/* {loading && <Loading />} */}
      {/* {error && (
        <article>
          <h2>Error during circles fetch</h2>
          <code>{error}</code>
        </article>
      )} */}
      {/* {circles.map(circle => (
        <li key={circle.circle_id}> */}
      <article>
        <h2>CREER UN NOUVEAU CERCLE :</h2>
        <form onSubmit={() => onSubmit()}>
          {/* // onSubmit={e => {
        //   e.preventDefault()
        //   onCreateCircle(
        //     e.target.name.value,
        //     e.target.purpose.value,
        //     e.target.domain.value,
        //     e.target.accountabilities.value
        //   )
        // }} */}

          <label>Nom du cercle:</label>
          <input type="text" required name="circle_name" />
          <br />
          <br />
          <label>Objectif(s):</label>
          <input type="text" required name="circle_purpose" />
          <br />
          <br />
          <label>Domaine:</label>
          <input type="text" required name="circle_domain" />
          <br />
          <br />
          <label>Redevabilités:</label>
          <input type="text" required name="circle_accountabilities" />
          <br />
          <br />
          <input type="submit" value="Créer un cercle" />
        </form>
      </article>
      <br />
      <article>
        <ul>
          <h2>LISTE DES CERCLES :</h2>
          {/* {circles.map(circle => (
            <li key={circle.circle_id}>{circle.circle_name}</li>
          ))} */}
        </ul>
      </article>
      <article>
        <ul>
          <h2>MÀJ UN CERCLE :</h2>
          <label>Cercle: </label>
          <select>
            <option>Valeur 1</option>
            <option>Valeur 2</option>
            <option>Valeur 3</option>
          </select>
          <br />
          <button type="submit"> Modifier</button>
          {/* GERER ICI AFFICHAGE DE FORM AU CLIQUE  */}
          {/* {circles.map(circle => (
            <li key={circle.circle_id}>{circle.circle_name}</li>
          ))} */}
        </ul>
      </article>
      {/* </li>
      ))} */}
      {/* {(console.log('circles'), console.log(circles))} */}
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
    onSubmit: () => {
      dispatch(createCircle())
    },
  })
  // dispatch => ({
  //   onSubmit: e => {
  //     e.preventDefault()
  //     const formCircle = [].slice
  //       .call(e.target.elements)
  //       .reduce(function(map, obj) {
  //         if (obj.name) {
  //           map[obj.name] = obj.value
  //         }
  //         return map
  //       })
  //     dispatch(createCircle(formCircle))
  //   },
  // })
  // , dispatch => ({
  //   onCreateCircle: (name, purpose, domain, accountabilities) => {
  //     dispatch(createCircle(name, purpose, domain, accountabilities))
  //   },
  // })
)(Organisation)
