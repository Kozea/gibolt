import React from 'react'

import {
  addItem,
  cancelClickItem,
  delItem,
  dispatchForm,
  editClickItem,
  updateItem,
} from '../../actions/roles'
import { block, connect } from '../../utils'

const b = block('Role')

function Items(props) {
  const {
    formType,
    items,
    itemType,
    role,
    roles,
    title,
    onAddItem,
    submitItem,
    cancelEditItem,
    deleteItem,
    editItem,
    onEditItem,
  } = props
  return (
    <article>
      <h3>
        {title}{' '}
        <span
          onClick={() => onAddItem(itemType)}
          className={b('unlink')}
          title="Add item"
        >
          <i className="fa fa-plus-circle" aria-hidden="true" />
        </span>
      </h3>
      <div>
        <ul>
          {items.results
            .filter(item => item.item_type === itemType)
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
                      <label>
                        edit item:{' '}
                        <input
                          name="content"
                          className={b('short')}
                          defaultValue={item.content}
                          required
                        />
                      </label>
                      <label>
                        role :
                        <select
                          name="role_id"
                          className={b('short')}
                          defaultValue={item.role_id}
                        >
                          {roles &&
                            roles
                              .filter(rol => rol.circle_id === role.circle_id)
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
                    <span className={b('bullet')} />
                    {item.content}{' '}
                    <span
                      onClick={e => {
                        e.preventDefault()
                        onEditItem(item.item_id)
                      }}
                      title="Edit item"
                    >
                      <i className="fa fa-pencil-square-o" aria-hidden="true" />
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
          {formType && (
            <form
              onSubmit={e => {
                e.preventDefault()
                submitItem(role, itemType, e)
              }}
            >
              <label>New item:</label>
              <input name="content" required />
              <button type="submit">Send</button>
            </form>
          )}
        </ul>
      </div>
    </article>
  )
}

export default connect(
  state => ({ roles: state.roles.results }),
  dispatch => ({
    onAddItem: itemType => {
      dispatch(dispatchForm(itemType))
    },
    deleteItem: itemId => {
      dispatch(delItem(itemId))
    },
    editItem: (item, e) => {
      const formItem = [].slice
        .call(e.target.elements)
        .reduce(function(map, obj) {
          map.item_type = item.item_type
          if (obj.name) {
            map[obj.name] = obj.value
          }
          return map
        }, {})
      dispatch(updateItem(item.item_id, formItem))
    },
    onEditItem: itemId => dispatch(editClickItem(itemId)),
    cancelEditItem: itemId => dispatch(cancelClickItem(itemId)),
    submitItem: (role, itemType, e) => {
      const formChecklist = {
        role_id: role.role_id,
        item_type: itemType,
        content: e.target.content.value,
      }
      dispatch(addItem(formChecklist))
      dispatch(dispatchForm(itemType))
    },
  })
)(Items)
