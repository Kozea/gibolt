import './Role.sass'

import React from 'react'
import { Helmet } from 'react-helmet'

import { connect } from '../utils'
import Loading from './Loading'
import { deleteRole, updateRole } from '../actions/roles'
import { editRole } from '../actions'

function Role({
  btnClick,
  circles,
  editClick,
  error,
  loading,
  onEditRole,
  role,
  users,
}) {
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
        <h3>Circle</h3>
        <div>
          <p>
            {circles.find(circle => circle.circle_id === role.circle_id) &&
              circles.find(circle => circle.circle_id === role.circle_id)
                .circle_name}
          </p>
        </div>
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
      <article>
        {role.is_in_edition ? (
          <form
            onSubmit={e => {
              e.preventDefault()
              onEditRole(role, e)
            }}
          >
            <h1>Edit {role.role_name} circle :</h1>
            <label>
              Circle :
              <select name="circle_id" defaultValue={role.circle_id}>
                {circles.map(circle => (
                  <option key={circle.circle_id} value={circle.circle_id}>
                    {circle.circle_name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              User :
              <select name="user_id" defaultValue={role.user_id}>
                {users.map(user => (
                  <option key={user.user_id} value={user.user_id}>
                    {user.user_name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Name :
              <input name="role_name" defaultValue={role.role_name} required />
            </label>
            <label>
              Purpose :
              <input
                name="role_purpose"
                defaultValue={role.role_purpose}
                required
              />
            </label>
            <label>
              Domain :
              <input
                name="role_domain"
                defaultValue={role.role_domain}
                required
              />
            </label>
            <label>
              Accountabilities :
              <input
                name="role_accountabilities"
                defaultValue={role.role_accountabilities}
                required
              />
            </label>
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
    circles: state.circles.results,
    error: state.role.error,
    loading: state.role.loading,
    role: state.role.results,
    roles: state.roles.results,
    users: state.users.results,
  }),
  dispatch => ({
    btnClick: data => {
      dispatch(deleteRole(data))
    },
    editClick: () => {
      dispatch(editRole())
    },
    onEditRole: (role, e) => {
      const formRole = [].slice.call(e.target.elements).reduce(
        function(map, obj) {
          if (obj.name) {
            map[obj.name] = obj.value
          }
          return map
        },
        { circle_id: role.circle_id }
      )
      dispatch(updateRole(role.role_id, formRole))
    },
  })
)(Role)