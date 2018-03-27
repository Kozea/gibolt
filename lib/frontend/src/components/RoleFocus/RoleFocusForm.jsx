import './RoleFocus.sass'

import { addDays, format } from 'date-fns'
import React from 'react'
import { withRouter } from 'react-router-dom'

import { editRoleFocus, updateFocus } from '../../actions/rolefocus'
import { block, connect } from '../../utils'

const b = block('RoleFocus')

class RoleFocusForm extends React.Component {
  constructor(props, context) {
    super(props, context)
    this.state = {
      duration: null,
      focus: '',
      startDate: null,
      user: '',
    }
  }

  render() {
    const {
      onCancel,
      onSubmit,
      role,
      roleFocus,
      roleFocusUser,
      roles,
      users,
    } = this.props
    const duration =
      this.state.duration === null
        ? roleFocus.duration
        : this.state.duration === '' ? null : this.state.duration
    const startDate = this.state.startDate
      ? this.state.startDate
      : roleFocus.role_focus_users[0].start_date
    const endDate =
      duration > 0 && startDate
        ? format(addDays(new Date(startDate), duration), 'DD/MM/YYYY (dddd)')
        : null
    return (
      <article className={b()}>
        <form
          onSubmit={e => {
            e.preventDefault()
            onSubmit(
              e,
              roleFocus.role_focus_id,
              roleFocusUser.role_focus_user_id
            )
          }}
        >
          <label>
            Role name :
            <select
              className={b('long')}
              defaultValue={role.role_id}
              name="role_id"
              required
            >
              <option value="" />
              {roles.filter(rol => rol.is_active).map(rol => (
                <option key={rol.role_id} value={rol.role_id}>
                  {rol.role_name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Focus name:
            <input
              name="focus_name"
              className={b('long')}
              defaultValue={roleFocus.focus_name}
            />
          </label>
          <label>
            Duration (in days) :
            <span className={b('duration')}>
              <input
                defaultValue={roleFocus.duration ? roleFocus.duration : ''}
                min="0"
                name="duration"
                onChange={e => {
                  this.setState({
                    duration: e.target.value === '' ? '' : +e.target.value,
                  })
                }}
                type="number"
              />
            </span>
          </label>
          <label>
            Filled by:
            <select
              className={b('long')}
              defaultValue={roleFocusUser.user_id}
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
            Start date:
            <span className={b('duration')}>
              <input
                defaultValue={
                  roleFocusUser.start_date
                    ? format(new Date(roleFocusUser.start_date), 'YYYY-MM-DD')
                    : ''
                }
                name="start_date"
                onChange={e => {
                  this.setState({ startDate: e.target.value })
                }}
                type="date"
              />
            </span>
          </label>
          <label>
            End date:
            <span className={b('duration')}>
              <input
                defaultValue={
                  roleFocusUser.end_date
                    ? format(new Date(roleFocusUser.end_date), 'YYYY-MM-DD')
                    : ''
                }
                name="end_date"
                type="date"
              />
              <span className={b('endDate')}>
                {endDate && ` calculated end date: ${endDate}`}
              </span>
            </span>
          </label>
          <button type="submit">Submit</button>
          <button type="button" onClick={() => onCancel()}>
            Cancel
          </button>
        </form>
      </article>
    )
  }
}

export default withRouter(
  connect(
    () => ({}),
    dispatch => ({
      onCancel: () => {
        dispatch(editRoleFocus(false))
      },
      onSubmit: (e, roleFocusId, roleFocusUserId) => {
        const formRoleFocus = {}
        formRoleFocus.role_focus_id = roleFocusId
        const formRoleFocusUser = [].slice.call(e.target.elements).reduce(
          function(map, obj) {
            if (obj.name === 'start_date' || obj.name === 'end_date') {
              map[obj.name] = obj.value ? format(new Date(obj.value)) : null
            } else if (obj.name === 'focus_name' || obj.name === 'role_id') {
              formRoleFocus[obj.name] = obj.value
            } else if (obj.name === 'duration') {
              formRoleFocus[obj.name] = obj.value === '' ? null : +obj.value
            } else if (obj.name && obj.value) {
              map[obj.name] = obj.value
            }
            return map
          },
          { role_focus_user_id: roleFocusUserId }
        )
        dispatch(updateFocus(formRoleFocus, formRoleFocusUser))
      },
    })
  )(RoleFocusForm)
)
