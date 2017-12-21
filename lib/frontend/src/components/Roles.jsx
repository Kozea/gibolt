// import './Roles.sass'

import React from 'react'
import { Helmet } from 'react-helmet'

import { block, connect } from '../utils'
import { createRole } from '../actions/roles'
import Loading from './Loading'

// const b = block('Roles')

function Roles({ error, loading, roles }) {
  return (
    <section>
      <Helmet>
        <title>Gibolt - Roles</title>
      </Helmet>
      {error && (
        <article>
          <h2>Error during issue fetch</h2>
          <code>{error}</code>
        </article>
      )}
      {loading && <Loading />}
      {roles.length > 0 ? <ul /> : <span>No roles defined</span>}
      <article />
    </section>
  )
}
export default connect(
  state => ({
    roles: state.roles.results,
    loading: state.circles.loading,
    error: state.circles.errors,
  }),
  dispatch => ({
    onSubmit: e => {
      const formRole = [].slice
        .call(e.target.elements)
        .reduce(function(map, obj) {
          if (obj.name && obj.value) {
            map[obj.name] = obj.value
          }

          return map
        }, {})
      dispatch(createRole(formRole))
    },
  })
)(Roles)
