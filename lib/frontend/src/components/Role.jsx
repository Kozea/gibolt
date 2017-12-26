import './Role.sass'

import React from 'react'
import { Helmet } from 'react-helmet'

import { connect } from '../utils'
import Loading from './Loading'
import { deleteRole, updateRole } from '../actions/roles'
import { editRole } from '../actions'

// const b = block('role')

function Role({ role, error, loading, btnClick, onEditRole, editClick }) {
  return (
    <section>
      <Helmet>
        <title>Gibolt - Role</title>
      </Helmet>
      <h1>{role.role_name}</h1>
      {error && (
        <article>
          <h2>Error during issue fetch</h2>
          {typeof error === 'object' ? (
            <ul>
              {error.map(err => (
                <li key={err.id}>
                  <span />
                  {err.value}
                </li>
              ))}
            </ul>
          ) : (
            <code>{error}</code>
          )}
        </article>
      )}
      {loading && <Loading />}
      <article>
        <h3>Purpose</h3>
        <div>
          <p>{role.role_purpose}</p>
        </div>
        <h3>Domains</h3>
        <div>
          <p>{role.role_domain}</p>
        </div>
        <h3>Accountabilities</h3>
        <div>
          <p>{role.role_accountabilities}</p>
        </div>
      </article>
      <br />
      <article>
        {role.is_in_edition ? (
        <form
          onSubmit={e => {
            e.preventDefault()
            onEditRole(role.role_id, e)
          }}
        >
          <label>
            Circle :
            <input
              name="circle_id"
              value={role.circle_id}
              disabled
            />
          </label>
          <label>
            User :
            <input
              name="user_id"
              value={role.user_id}
              disabled
            />
          </label>
          <label>
            Name :
            <input name="role_name" defaultValue={role.role_name} required />
          </label>
          <br />
          <label>
            Purpose :
            <input
              name="role_purpose"
              defaultValue={role.role_purpose}
              required
            />
          </label>
          <br />
          <label>
            Domain :
            <input
              name="role_domain"
              defaultValue={role.role_domain}
              required
            />
          </label>
          <br />
          <label>
            Accountabilities :
            <input
              name="role_accountabilities"
              defaultValue={role.role_accountabilities}
              required
            />
          </label>
          <br />
          <input type="submit" value="Edit role" />
        </form>
      ) : (
        ''
      )}
        <button type="submit" onClick={() => editClick()}>
          {role.is_in_edition ? 'Cancel' : 'Update'}
        </button>
        <button
          type="submit"
          onClick={() => {
            btnClick(role.role_id)
          }}
        >
          Delete role
        </button>
      </article>
    </section>
  )
}
export default connect(
  state => ({
    roles: state.roles.results,
    role: state.role.results,
    loading: state.role.loading,
    error: state.role.error,
    users: state.users.results,
  }),
  dispatch => ({
    btnClick: data => {
      dispatch(deleteRole(data))
    },
    onEditRole: (id, e) => {
      const formRole = [].slice
        .call(e.target.elements)
        .reduce(function(map, obj) {
          if (obj.name) {
            map[obj.name] = obj.value
          }

          return map
        }, {})
      dispatch(updateRole(id, formRole))
    },
    editClick: () => {
      dispatch(editRole())
    },
  })
)(Role)
