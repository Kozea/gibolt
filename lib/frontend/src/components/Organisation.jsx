import React from 'react'
import { Helmet } from 'react-helmet'

import { connect } from '../utils'
// import Loading from './Loading'
import { createCircle } from '../actions'

function Organisation({ circle, onSubmit }) {
  return (
    <article>
      <form onSubmit={e => onSubmit(e, circle)}>
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
  )
}

export default connect(
  state => ({
    promotions: state.promotions,
    communications: state.communications,
  }),
  dispatch => ({
    onSubmit: (e, circle) => {
      e.preventDefault()
      const formCampaign = [].slice
        .call(e.target.elements)
        .reduce(function(map, obj) {
          if (obj.name) {
            map[obj.name] = obj.value
          }
          return map
        })
      dispatch(createCircle(formCampaign))
    },
  })
)(Organisation)
