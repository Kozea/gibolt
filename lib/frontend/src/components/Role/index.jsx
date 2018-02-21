import './Role.sass'

import React from 'react'
import { Helmet } from 'react-helmet'
import { withRouter } from 'react-router-dom'

import { updateMarkdown, fetchResults, setLoading } from '../../actions'
import {
  deleteRole,
  editRole,
  fetchItems,
  fetchRole,
  fetchRoles,
  updateRole,
} from '../../actions/roles'
import { block, connect } from '../../utils'
import Items from './Items'
import Loading from './../Loading'
import MarkdownEditor from './../Utils/MarkdownEditor'

const b = block('Role')
var ReactMarkdown = require('react-markdown')

class Role extends React.Component {
  componentDidMount() {
    this.props.sync()
  }
  componentWillReceiveProps(nextProps) {
    if (
      (nextProps.location.pathname !== this.props.location.pathname &&
        nextProps.location.pathname === '/role') ||
      (nextProps.location.pathname === this.props.location.pathname &&
        nextProps.location.search !== this.props.location.search)
    ) {
      this.props.sync()
    }
  }

  render() {
    const {
      btnClick,
      circles,
      editClick,
      error,
      history,
      items,
      loading,
      onEditRole,
      onGoBack,
      role,
      roles,
      users,
    } = this.props
    return (
      <section className={b()}>
        <Helmet>
          <title>Gibolt - Role</title>
        </Helmet>
        <article className={b('role')}>
          <h1>
            {role.role_name}{' '}
            <span
              onClick={() => editClick(role.role_accountabilities)}
              title="Edit role"
            >
              <i className="fa fa-pencil-square-o" aria-hidden="true" />
            </span>{' '}
            {items.results.filter(item => item.role_id === role.role_id)
              .length > 0 ? (
              ''
            ) : (
              <span
                onClick={() => btnClick(role.role_id, role.circle_id, history)} // eslint-disable-line max-len
                title="Delete role"
              >
                <i className="fa fa-trash" aria-hidden="true" />
              </span>
            )}
          </h1>
          {items.results.filter(item => item.role_id === role.role_id).length >
          0 ? (
            <code>
              {'You cannot delete this role, '}
              {'please first delete the items.'}
            </code>
          ) : (
            ' '
          )}
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
            <article>
              <form
                onSubmit={e => {
                  e.preventDefault()
                  onEditRole(role, e, history)
                }}
              >
                <h1>Edit {role.role_name} role :</h1>
                <label>
                  Circle :
                  <select
                    name="circle_id"
                    defaultValue={role.circle_id}
                    className={b('long')}
                  >
                    {circles.map(circle => (
                      <option key={circle.circle_id} value={circle.circle_id}>
                        {circle.circle_name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  User :
                  <select
                    name="user_id"
                    defaultValue={role.user_id}
                    className={b('long')}
                  >
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
                    className={b('long')}
                    defaultValue={role.role_name}
                    required
                  />
                </label>
                <label>
                  Purpose :
                  <input
                    name="role_purpose"
                    className={b('long')}
                    defaultValue={role.role_purpose}
                    required
                  />
                </label>
                <label>
                  Domain :
                  <input
                    name="role_domain"
                    className={b('long')}
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
            </article>
          ) : (
            <article>
              <h3>Circle</h3>
              <div>
                <p>
                  {circles.find(
                    circle => circle.circle_id === role.circle_id
                  ) &&
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
              <Items
                formType={items.form_checklist}
                items={items}
                itemType="checklist"
                title="Recurrent actions"
                role={role}
                roles={roles}
              />
              <Items
                formType={items.form_indicator}
                items={items}
                itemType="indicator"
                title="Indicators"
                role={role}
                roles={roles}
              />
              <button
                type="submit"
                onClick={() => onGoBack(role.circle_id, history)}
              >
                Back to circle
              </button>
            </article>
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
      items: state.items,
      loading: state.role.loading,
      location: state.router.location,
      role: state.role.results,
      roles: state.roles.results,
      users: state.users.results,
    }),
    dispatch => ({
      btnClick: (roleId, circleId, history) => {
        dispatch(deleteRole(roleId, circleId, history))
      },
      editClick: content => {
        dispatch(editRole())
        dispatch(updateMarkdown(content))
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
        dispatch(updateMarkdown(''))
        dispatch(fetchRole())
      },
      onGoBack: (circleId, history) => {
        history.push(`/circle?circle_id=${circleId}`)
      },
      loadItems: () => {
        dispatch(setLoading('items'))
        dispatch(fetchItems())
      },
      sync: () => {
        dispatch(setLoading('circles'))
        dispatch(fetchResults('circles'))
        dispatch(setLoading('users'))
        dispatch(fetchResults('users'))
        dispatch(setLoading('role'))
        dispatch(fetchRole())
        dispatch(setLoading('roles'))
        dispatch(fetchRoles())
      },
    })
  )(Role)
)
