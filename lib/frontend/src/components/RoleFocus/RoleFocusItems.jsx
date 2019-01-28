import block from 'bemboo'
import React from 'react'

import {
  addItem,
  cancelClickItem,
  delItem,
  editClickItem,
  updateItem,
} from '../../actions/rolefocus'
import { connect } from '../../utils'

const b = block('RoleFocus')

class RoleFocusItems extends React.Component {
  constructor(props, context) {
    super(props, context)
    this.state = {
      displayForm: false,
    }
  }
  onDisplayForm(value) {
    this.setState({ displayForm: value })
  }
  render() {
    const {
      items,
      itemType,
      roleFocus,
      roles,
      title,
      submitItem,
      cancelEditItem,
      deleteItem,
      editItem,
      onEditItem,
    } = this.props
    const { displayForm } = this.state
    return (
      <article>
        <h3>
          {title}{' '}
          <span
            onClick={() => this.onDisplayForm(true)}
            className={b.e('unlink')}
            title="Add item"
          >
            <i className="fa fa-plus-circle" aria-hidden="true" />
          </span>
        </h3>
        <div>
          {items.length > 0 ? (
            <ul>
              {items.map(item => (
                <li key={item.item_id}>
                  <span className={b.e('bullet')} />
                  {item.editItem ? (
                    <div>
                      <form
                        onSubmit={e => {
                          e.preventDefault()
                          editItem(item, e, roleFocus.role_focus_id)
                        }}
                      >
                        <span>
                          <label>
                            item :{' '}
                            <input
                              name="content"
                              className={b.e('item')}
                              defaultValue={item.content}
                              required
                            />
                          </label>
                          <label>
                            role :{' '}
                            <select
                              name="role_focus_id"
                              className={b.e('item')}
                              defaultValue={item.role_focus_id}
                            >
                              {roles.map(role =>
                                role.role_focuses.map(focus => (
                                  <option
                                    key={focus.role_focus_id}
                                    value={focus.role_focus_id}
                                  >
                                    {role.role_name}
                                    {focus.focus_name !== '' &&
                                      ` - ${focus.focus_name}`}
                                  </option>
                                ))
                              )}
                            </select>
                          </label>
                        </span>

                        <button type="submit">Send</button>
                        <button
                          type="button"
                          onClick={() => cancelEditItem(item.item_id)}
                        >
                          Cancel
                        </button>
                      </form>
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
            </ul>
          ) : (
            `No ${itemType}s defined`
          )}
          {displayForm && (
            <form
              onSubmit={e => {
                e.preventDefault()
                submitItem(roleFocus.role_focus_id, itemType, e)
                this.onDisplayForm(false)
              }}
            >
              <label>New item:</label>{' '}
              <input name="content" className={b.e('item')} required />
              <button type="submit">Send</button>
              <button type="button" onClick={() => this.onDisplayForm(false)}>
                Cancel
              </button>
            </form>
          )}
        </div>
      </article>
    )
  }
}

export default connect(
  () => ({}),
  dispatch => ({
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
    submitItem: (roleFocusId, itemType, e) => {
      const formChecklist = {
        role_focus_id: roleFocusId,
        item_type: itemType,
        content: e.target.content.value,
      }
      dispatch(addItem(formChecklist))
    },
  })
)(RoleFocusItems)
