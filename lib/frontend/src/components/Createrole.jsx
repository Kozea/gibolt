// import './Createrole.sass'

import React from 'react'

import { block, connect } from '../utils'
import { createRole } from '../actions/roles'
import Loading from './Loading'

const b = block('Createrole')

function Createrole({ loading, onSubmit, users, circle }) {
  return (
    <article className={b()}>
      {loading && <Loading />}
      <h2>Create a new role :</h2>
      <form
        onSubmit={e => {
          e.preventDefault()
          onSubmit(circle.circle_id, e)
        }}
      >
        <label>
          Name :
          <input name="role_name" required />
        </label>
        <br />
        <label>
          User :
          <select name="user_id" defaultValue="">
            {users.map(user => (
              <option key={user.user_id} value={user.user_id}>
                {user.user_name}
              </option>
            ))}
          </select>
        </label>
        <br />
        <label>
          Purpose :
          <input name="role_purpose" required />
        </label>
        <br />
        <label>
          Domain :
          <input name="role_domain" required />
        </label>
        <br />
        <label>
          Accountabilities :
          <br />
          <textarea name="role_accountabilities" rows="5" cols="40" required />
        </label>
        <br />
        <label>
          Checklist :
          <br />
          <textarea name="role_checklist" rows="5" cols="40" required />
        </label>
        <br />
        <input type="submit" value="Create role" />
      </form>
    </article>
  )
}
export default connect(
  state => ({
    roles: state.roles.results,
    circle: state.circle.results,
    users: state.users.results,
    loading: state.circles.loading,
    error: state.circles.errors,
  }),
  dispatch => ({
    onSubmit: (circleId, e) => {
      const formRole = [].slice.call(e.target.elements).reduce(
        function(map, obj) {
          if (obj.name && obj.value) {
            map[obj.name] = obj.value
          }

          return map
        },
        { circle_id: circleId }
      )
      dispatch(createRole(formRole))
    },
  })
)(Createrole)
