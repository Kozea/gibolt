import './Createrole.sass'

import React from 'react'
import { Helmet } from 'react-helmet'
import { withRouter } from 'react-router-dom'

import { goBack } from '../actions'
import { createRole } from '../actions/roles'
import { block, connect } from '../utils'
import Loading from './Loading'
import MarkdownEditor from './MarkdownEditor'

const b = block('Createrole')

function Createrole({ circle, history, loading, onGoBack, onSubmit, users }) {
  return (
    <article className={b()}>
      <Helmet>
        <title>Gibolt - Create a role</title>
      </Helmet>
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
          <MarkdownEditor />
        </label>
        <br />
        <button type="submit">Create role</button>
        <button type="submit" onClick={() => onGoBack(history)}>
          Cancel
        </button>
      </form>
    </article>
  )
}

export default withRouter(
  connect(
    state => ({
      roles: state.roles.results,
      circle: state.circle.results,
      users: state.users.results,
      loading: state.circles.loading,
      error: state.circles.errors,
    }),
    dispatch => ({
      onGoBack: history => {
        dispatch(goBack(history))
      },
      onSubmit: (circleId, e) => {
        const formRole = [].slice.call(e.target.elements).reduce(
          function(map, obj) {
            if (obj.name === 'body') {
              map.role_accountabilities = obj.value
            } else if (obj.name && obj.value) {
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
)