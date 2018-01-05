import './Role.sass'

import React from 'react'
import { Helmet } from 'react-helmet'

import { block, connect } from '../utils'
import Loading from './Loading'
import MarkdownEditor from './MarkdownEditor'
import {
  deleteRole,
  updateRole,
  addItem,
  fetchRole,
  fetchItems,
  delItem,
} from '../actions/roles'
import {
  checkForm,
  checkAcc,
  editRole,
  indicatorForm,
  setLoading,
} from '../actions'

const b = block('Role')
var ReactMarkdown = require('react-markdown')

class Role extends React.Component {
  componentDidMount() {
    const { loadItems } = this.props
    loadItems()
  }

  render() {
    const {
      addChecklist,
      addIndicator,
      addClick,
      btnClick,
      circles,
      // deleteItem,
      editClick,
      error,
      items,
      loading,
      onAddClick,
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
            <h3>Checklist</h3>
            <div>
              {/* {items.find(item => item.item_type === 'checklist') &&
                items.find(item => item.role_id === role.role_id) &&
                items.map(item => (
                  <li key={item.item_id}>
                    {item.content}
                    <button
                      type="submit"
                      onClick={() => deleteItem(item.item_id)}
                    >
                      delete
                    </button>
                  </li>
                ))} */}
              {items.form_checklist ? (
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
              ) : (
                ''
              )}
              <button type="submit" onClick={() => addClick()}>
                {items.form_checklist ? 'Cancel' : 'Add item'}
              </button>
            </div>
            <h3>Indicators</h3>
            <div>
              {/* {items.find(item => item.item_type === 'indicator') &&
                items.find(item => item.role_id === role.role_id) &&
                items.map(item => (
                  <li key={item.item_id}>
                    {item.content}
                    <button
                      type="submit"
                      onClick={() => deleteItem(item.item_id)}
                    >
                      delete
                    </button>
                  </li>
                ))} */}
              {items.form_indicator ? (
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
              ) : (
                ''
              )}
              <button type="submit" onClick={() => onAddClick()}>
                {items.form_indicator ? 'Cancel' : 'Add item'}
              </button>
            </div>
          </article>
        )}
        <article>
          {role.is_in_edition ? (
            <form
              onSubmit={e => {
                e.preventDefault()
                onEditRole(role, e)
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
              <input type="submit" value="Edit role" />
            </form>
          ) : (
            ''
          )}
          <button
            type="submit"
            onClick={() => editClick(role.role_accountabilities)}
          >
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
}

export default connect(
  state => ({
    circles: state.circles.results,
    error: state.role.error,
    items: state.items.results,
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
    btnClick: data => {
      dispatch(deleteRole(data))
    },
    editClick: content => {
      dispatch(editRole())
      dispatch(checkAcc(content))
    },
    onEditRole: (role, e) => {
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
      dispatch(updateRole(role.role_id, formRole))
      dispatch(checkAcc(''))
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
    },
    loadItems: () => {
      dispatch(setLoading('items'))
      dispatch(fetchItems())
    },
    deleteItem: itemId => {
      dispatch(delItem(itemId))
    },
  })
)(Role)
