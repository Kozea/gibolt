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
    const { onCancel, onSubmit, role, roleFocus, roleFocusUser } = this.props
    const endDate =
      role.duration > 0 && this.state.startDate
        ? format(
            addDays(new Date(this.state.startDate), role.duration),
            'DD/MM/YYYY (dddd)'
          )
        : null
    return (
      <article className={b()}>
        <label>
          Role name :
          <input
            name="role_name"
            className={b('long')}
            defaultValue={role.role_name}
            disabled
          />
        </label>
        <label>
          Filled by:
          <input
            name="role_name"
            className={b('long')}
            defaultValue={roleFocusUser.user_name}
            disabled
          />
        </label>
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
            Focus name:
            <input
              name="focus_name"
              className={b('long')}
              defaultValue={roleFocus.focus_name}
            />
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
              <span className={b('endDate')}>
                {endDate && `until ${endDate}`}
              </span>
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
            } else if (obj.name === 'focus_name' && obj.value) {
              formRoleFocus.focus_name = obj.value
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
