import './Roles.sass'
import { stringify } from 'query-string'
import React from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'

import { block, connect } from '../utils'
import { createRole } from '../actions/roles'
import Loading from './Loading'

const b = block('Roles')

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
      <article className={b('roles')}>
        <h2>Roles</h2>
      {roles.length > 0 ? (
        <ul>
          {roles.map(role => (
            <li key={role.role_id} className={b('item')}>
              <Link
                className={b('link')}
                to={{
                  pathname: '/role',
                  search: stringify({ id: role.role_id }),
                }}
              >
                <span className={b('unlink')} />
                {role.role_name}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <span>No roles defined</span>
      )}
    </article>
    </section>
  )
}
export default connect(
  state => ({
    circles: state.circles.results,
    error: state.circles.errors,
    loading: state.circles.loading,
    roles: state.roles.results,
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
