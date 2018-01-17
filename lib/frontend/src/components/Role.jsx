import './Role.sass'

import React from 'react'
import { Helmet } from 'react-helmet'
import { withRouter } from 'react-router-dom'

import { checkAccountabilities, fetchResults, setLoading } from '../actions'
import {
  addItem,
  cancelClickItem,
  checkForm,
  deleteRole,
  delItem,
  editClickItem,
  editRole,
  fetchItems,
  fetchRole,
  fetchRoles,
  indicatorForm,
  updateItem,
  updateRole,
} from '../actions/roles'
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
      addChecklist,
      addClick,
      addIndicator,
      btnClick,
      cancelEditItem,
      circles,
      deleteItem,
      editClick,
      editItem,
      error,
      history,
      items,
      loading,
      onAddClick,
      onEditItem,
      onEditRole,
      role,
      roles,
      users,
    } = this.props
    return (
      <section className={b()}>
        <Helmet>
          <title>Gibolt - Role</title>
        </Helmet>
        <h1>
          {role.role_name}{' '}
          <span
            onClick={() => editClick(role.role_accountabilities)}
            title="Edit role"
          >
            <i className="fa fa-pencil-square-o" aria-hidden="true" />
          </span>{' '}
          {items.results.filter(item => item.role_id === role.role_id).length >
          0 ? (
            ''
          ) : (
            <span
              onClick={() => btnClick(role.role_id, role.circle_id, history)}
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
          </article>
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
            <h3>
              Recurrent actions{' '}
              <span
                onClick={() => addClick()}
                className={b('unlink')}
                title="Add item"
              >
                <i className="fa fa-plus-circle" aria-hidden="true" />
              </span>
            </h3>
            <div>
              {items.results
                .filter(item => item.item_type === 'checklist')
                .map(item => (
                  <li key={item.item_id}>
                    {item.editItem ? (
                      <div>
                        <form
                          onSubmit={e => {
                            e.preventDefault()
                            editItem(item, e, role.role_id)
                          }}
                        >
                          <label>edit item:</label>
                          <input
                            name="content"
                            defaultValue={item.content}
                            required
                          />
                          <label>
                            role :
                            <select name="role_id" defaultValue={item.role_id}>
                              {roles &&
                                roles
                                  .filter(
                                    rol => rol.circle_id === role.circle_id
                                  )
                                  .map(rolee => (
                                    <option
                                      key={rolee.role_id}
                                      value={rolee.role_id}
                                    >
                                      {rolee.role_name}
                                    </option>
                                  ))}
                            </select>
                          </label>
                          <button type="submit">Send</button>
                        </form>
                        <button
                          type="submit"
                          onClick={e => {
                            e.preventDefault()
                            cancelEditItem(item.item_id)
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <span>
                        {item.content}{' '}
                        <span
                          onClick={e => {
                            e.preventDefault()
                            onEditItem(item.item_id)
                          }}
                          title="Edit item"
                        >
                          <i
                            className="fa fa-pencil-square-o"
                            aria-hidden="true"
                          />
                        </span>{' '}
                        <span
                          onClick={() => deleteItem(item.item_id)}
                          title="Delete item"
                        >
                          <i className="fa fa-trash" aria-hidden="true" />
                        </span>
                      </span>
                    )}
                  </li>
                ))}
              {items &&
                items.form_checklist && (
                  <form
                    onSubmit={e => {
                      e.preventDefault()
                      addChecklist(role, e)
                    }}
                  >
                    <label>New item:</label>
                    <input name="content" required />
                    <button type="submit">Send</button>
                  </form>
                )}
            </div>
            <h3>
              Indicators{' '}
              <span
                onClick={() => onAddClick()}
                className={b('unlink')}
                title="Add item"
              >
                <i className="fa fa-plus-circle" aria-hidden="true" />
              </span>
            </h3>
            <div>
              {items.results
                .filter(item => item.item_type === 'indicator')
                .map(item => (
                  <li key={item.item_id}>
                    {item.editItem ? (
                      <div>
                        <form
                          onSubmit={e => {
                            e.preventDefault()
                            editItem(item, e, role.role_id)
                          }}
                        >
                          <label>edit item:</label>
                          <input
                            name="content"
                            defaultValue={item.content}
                            required
                          />
                          <label>
                            role :
                            <select name="role_id" defaultValue={item.role_id}>
                              {roles &&
                                roles
                                  .filter(
                                    rol => rol.circle_id === role.circle_id
                                  )
                                  .map(rolee => (
                                    <option
                                      key={rolee.role_id}
                                      value={rolee.role_id}
                                    >
                                      {rolee.role_name}
                                    </option>
                                  ))}
                            </select>
                          </label>
                          <button type="submit">Send</button>
                        </form>
                        <button
                          type="submit"
                          onClick={e => {
                            e.preventDefault()
                            cancelEditItem(item.item_id)
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <span>
                        {item.content}{' '}
                        <span
                          onClick={e => {
                            e.preventDefault()
                            onEditItem(item.item_id)
                          }}
                          title="Edit item"
                        >
                          <i
                            className="fa fa-pencil-square-o"
                            aria-hidden="true"
                          />
                        </span>{' '}
                        <span
                          onClick={() => deleteItem(item.item_id)}
                          title="Delete item"
                        >
                          <i className="fa fa-trash" aria-hidden="true" />
                        </span>
                      </span>
                    )}
                  </li>
                ))}
              {items.form_indicator && (
                <form
                  onSubmit={e => {
                    e.preventDefault()
                    addIndicator(role, e)
                  }}
                >
                  <label>New item:</label>
                  <input name="content" required />
                  <button type="submit">Send</button>
                </form>
              )}
            </div>
          </article>
        )}
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
      role: state.role.results,
      roles: state.roles.results,
      users: state.users.results,
    }),
    dispatch => ({
      addClick: () => {
        dispatch(checkForm())
      },
      onAddClick: () => {
        dispatch(indicatorForm())
      },
      btnClick: (roleId, circleId, history) => {
        dispatch(deleteRole(roleId, circleId, history))
      },
      editClick: content => {
        dispatch(editRole())
        dispatch(checkAccountabilities(content))
      },
      editItem: (item, e, roleId) => {
        const formItem = [].slice
          .call(e.target.elements)
          .reduce(function(map, obj) {
            map.item_type = item.item_type
            if (obj.name) {
              map[obj.name] = obj.value
            }
            return map
          }, {})
        formItem.role_id = roleId
        dispatch(updateItem(item.item_id, formItem))
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
        dispatch(checkAccountabilities(''))
        dispatch(fetchRole())
      },
      addChecklist: (role, e) => {
        const formChecklist = [].slice
          .call(e.target.elements)
          .reduce(function(map, obj) {
            map.role_id = role.role_id
            map.item_type = 'checklist'
            if (obj.name === '0') {
              map.role_accountabilities = obj.value
            } else if (obj.name && obj.value) {
              map[obj.name] = obj.value
            }

            return map
          }, {})
        dispatch(addItem(formChecklist))
        dispatch(checkForm())
      },
      addIndicator: (role, e) => {
        const formChecklist = [].slice
          .call(e.target.elements)
          .reduce(function(map, obj) {
            map.role_id = role.role_id
            map.item_type = 'indicator'
            if (obj.name === '0') {
              map.role_accountabilities = obj.value
            } else if (obj.name && obj.value) {
              map[obj.name] = obj.value
            }

            return map
          }, {})
        dispatch(addItem(formChecklist))
        dispatch(indicatorForm())
      },
      loadItems: () => {
        dispatch(setLoading('items'))
        dispatch(fetchItems())
      },
      deleteItem: itemId => {
        dispatch(delItem(itemId))
      },
      onEditItem: itemId => dispatch(editClickItem(itemId)),
      cancelEditItem: itemId => dispatch(cancelClickItem(itemId)),
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
