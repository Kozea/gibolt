import './Role.sass'

import { addDays, format } from 'date-fns'
import React from 'react'

import { addFocus } from '../../actions/roles'
import { block, connect } from '../../utils'
import RoleFocusUser from './RoleFocusUser'

const b = block('Role')

class RoleFocuses extends React.Component {
  constructor(props, context) {
    super(props, context)
    this.state = {
      duration: null,
      displayForm: null,
      startDate: null,
    }
  }
  render() {
    const { focuses, isActive, onSubmit, roleId, users } = this.props
    const { displayForm, duration, startDate } = this.state
    const endDate =
      duration > 0 && startDate
        ? format(addDays(new Date(startDate), duration), 'DD/MM/YYYY (dddd)')
        : null

    return (
      <article>
        <h3>
          Focus{' '}
          {isActive && (
            <span
              className={b('unlink')}
              onClick={() => this.setState({ displayForm: true })}
              title="Add focus"
            >
              <i className="fa fa-plus-circle" aria-hidden="true" />
            </span>
          )}
        </h3>
        {focuses && focuses.length > 0 ? (
          <ul>
            {focuses.map(focus => (
              <li key={focus.role_focus_id}>
                <span className={b('bullet')} />
                <RoleFocusUser
                  duration={focus.duration}
                  focusName={focus.focus_name}
                  focusId={focus.role_focus_id}
                  focusUser={focus.role_focus_users[0]}
                />
              </li>
            ))}
          </ul>
        ) : (
          'No focus'
        )}
        {displayForm && (
          <span>
            <h4>Add a focus</h4>
            <form
              className={b('createFocusForm')}
              onSubmit={e => {
                e.preventDefault()
                onSubmit(e, roleId)
                this.setState({ displayForm: false })
              }}
            >
              <label>
                Role focus :
                <input
                  className={b('long')}
                  defaultValue=""
                  name="focus_name"
                />
              </label>
              <label>
                User :<br />
                <select
                  className={b('long')}
                  defaultValue=""
                  name="user_id"
                  required
                >
                  <option value="" />
                  {users.map(user => (
                    <option key={user.user_id} value={user.user_id}>
                      {user.user_name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Duration (in days) :
                <input
                  className={b('long')}
                  defaultValue=""
                  min="0"
                  name="duration"
                  onChange={e => {
                    this.setState({ duration: +e.target.value })
                  }}
                  type="number"
                />
              </label>
              <label>
                Start date:
                <span className={b('duration')}>
                  <input
                    defaultValue=""
                    name="start_date"
                    onChange={e => {
                      this.setState({ startDate: e.target.value })
                    }}
                    type="date"
                  />
                  <span className={b('endDate')}>
                    {endDate && (
                      <span>
                        <br />
                        {`  until ${endDate}`}
                      </span>
                    )}
                  </span>
                </span>
              </label>
              <button type="submit">Create</button>
              <button
                type="button"
                onClick={() => this.setState({ displayForm: false })}
              >
                Cancel
              </button>
            </form>
          </span>
        )}
        <br />
      </article>
    )
  }
}

export default connect(
  () => ({}),
  dispatch => ({
    onSubmit: (e, roleId) => {
      const formRoleFocus = [].slice.call(e.target.elements).reduce(
        function(map, obj) {
          if (obj.name && obj.value) {
            map[obj.name] = obj.value
          }
          return map
        },
        { role_id: roleId }
      )
      dispatch(addFocus(formRoleFocus))
    },
  })
)(RoleFocuses)