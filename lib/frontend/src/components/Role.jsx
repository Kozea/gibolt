import './Role.sass'

import React from 'react'
import { Helmet } from 'react-helmet'
import { withRouter } from 'react-router-dom'

import { editRole, fetchResults, setLoading } from '../actions'
import { deleteRole, fetchRole, updateRole } from '../actions/roles'
import { block, connect } from '../utils'
import Loading from './Loading'
import MarkdownEditor from './MarkdownEditor'

const b = block('Role')
var ReactMarkdown = require('react-markdown')

class Role extends React.Component {
  componentWillMount() {
    this.props.sync()
  }

  render() {
    const {
      btnClick,
      circles,
      editClick,
      error,
      history,
      loading,
      onEditRole,
      role,
      users,
    } = this.props
    return (
      <section className={b()}>
        <Helmet>
          <title>Gibolt - Role</title>
        </Helmet>
        <h1>{role.role_name}</h1>
        {error && (
          <article className={b('date', { error: true })}>
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
        {role.is_in_edition ? (
          ''
        ) : (
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
            <h3>Domain</h3>
            <div>
              <p>{role.role_domain}</p>
            </div>
            <h3>Accountabilities</h3>
            <div>
              <ReactMarkdown source={role.role_accountabilities} />
            </div>
          </article>
        )}
        <article>
          {role.is_in_edition ? (
            <form
              onSubmit={e => {
                e.preventDefault()
                onEditRole(role, e, history)
              }}
            >
              <h1>Edit {role.role_name} role :</h1>
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
                <input
                  name="role_name"
                  defaultValue={role.role_name}
                  required
                />
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
                <MarkdownEditor />
              </label>
              <button type="submit">Edit role</button>
              <button type="submit" onClick={() => editClick()}>
                Cancel
              </button>
            </form>
          ) : (
            <div>
              <button type="submit" onClick={() => editClick()}>
                Update
              </button>
              <button
                type="submit"
                onClick={() => {
                  btnClick(role.role_id, role.circle_id, history)
                }}
              >
                Delete role
              </button>
            </div>
          )}
        </article>
      </section>
    )
  }
}

export default withRouter(
  connect(
    state => ({
      circles: state.circles.results,
      error: state.role.error,
      loading: state.role.loading,
      role: state.role.results,
      users: state.users.results,
    }),
    dispatch => ({
      btnClick: (roleId, circleId, history) => {
        dispatch(deleteRole(roleId, circleId, history))
      },
      editClick: () => {
        dispatch(editRole())
      },
      onEditRole: (role, e, history) => {
        const formRole = [].slice.call(e.target.elements).reduce(
          function(map, obj) {
            if (obj.name === 'body') {
              map.role_accountabilities = obj.value
            } else if (obj.name) {
              map[obj.name] = obj.value
            }
            return map
          },
          { circle_id: role.circle_id }
        )
        dispatch(updateRole(role.role_id, formRole, history))
      },
      sync: () => {
        dispatch(setLoading('circles'))
        dispatch(fetchResults('circles'))
        dispatch(setLoading('users'))
        dispatch(fetchResults('users'))
        dispatch(setLoading('role'))
        dispatch(fetchRole())
      },
    })
  )(Role)
)
