import './RoleForm.sass'

import { addDays, format } from 'date-fns'
import React from 'react'
import { withRouter } from 'react-router-dom'

import { goBack, updateMarkdown } from '../../actions'
import { createRole, updateRole } from '../../actions/roles'
import { block, connect } from '../../utils'
import MarkdownEditor from '../Utils/MarkdownEditor'

const b = block('RoleForm')
const roleTypes = [
  { value: 'leadlink', name: 'Premier lien' },
  { value: 'elected', name: 'Rôle élu' },
  { value: 'assigned', name: 'Rôle désigné' },
]

class RoleForm extends React.Component {
  constructor(props, context) {
    super(props, context)
    this.state = {
      endDate: null,
    }
  }

  calculateEndDate(duration) {
    this.setState({
      endDate:
        duration || duration !== 0
          ? format(addDays(new Date(), duration), 'DD/MM/YYYY (dddd)')
          : null,
    })
  }

  render() {
    const {
      circle,
      circles,
      history,
      isCreation,
      onGoBack,
      onSubmit,
      role,
      users,
    } = this.props
    const { endDate } = this.state
    return (
      <article className={b()}>
        <form
          onSubmit={e => {
            e.preventDefault()
            onSubmit(isCreation, circle.circle_id, e, history, role.role_id)
          }}
        >
          <label>
            Circle :
            <select
              className={b('long')}
              disabled={isCreation}
              defaultValue={role.circle_id ? role.circle_id : circle.circle_id}
              name="circle_id"
              required
            >
              <option value="" />
              {circles.map(circ => (
                <option key={circ.circle_id} value={circ.circle_id}>
                  {circ.circle_name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Role type :
            <select
              className={b('long')}
              defaultValue={role.role_type ? role.role_type : ''}
              name="role_type"
              required
            >
              <option value="" />
              {roleTypes.map(roleType => (
                <option key={roleType.value} value={roleType.value}>
                  {roleType.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Role name :
            <input
              name="role_name"
              className={b('long')}
              defaultValue={role.role_name ? role.role_name : ''}
              required
            />
          </label>
          {isCreation && (
            <span>
              <label>
                Role focus :
                <input
                  className={b('long')}
                  defaultValue=""
                  name="focus_name"
                />
              </label>
              <label>
                User :
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
            </span>
          )}
          <label>
            Duration (in days) :
            <span className={b('duration')}>
              <input
                defaultValue={role.duration ? role.duration : ''}
                name="duration"
                onChange={e => this.calculateEndDate(+e.target.value)}
                type="number"
              />
              <span className={b('endDate')}>
                {endDate && `until ${endDate}`}
              </span>
            </span>
          </label>
          <label>
            Purpose :
            <input
              name="role_purpose"
              className={b('long')}
              defaultValue={role.role_purpose ? role.role_purpose : ''}
              required
            />
          </label>
          <label>
            Domain :
            <MarkdownEditor editorName="role_domain" />
          </label>
          <label>
            Accountabilities :
            <MarkdownEditor editorName="role_accountabilities" />
          </label>
          <button type="submit">Create role</button>
          <button type="button" onClick={() => onGoBack(history)}>
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
      onGoBack: history => {
        dispatch(goBack(history))
      },
      onSubmit: (isCreation, circleId, e, history, roleId) => {
        const formRole = [].slice.call(e.target.elements).reduce(
          function(map, obj) {
            if (obj.name && obj.value) {
              map[obj.name] = obj.value
            }
            return map
          },
          { circle_id: circleId }
        )
        if (isCreation) {
          dispatch(createRole(formRole, history))
        } else {
          dispatch(updateRole(roleId, formRole, history))
        }

        dispatch(updateMarkdown(''))
      },
    })
  )(RoleForm)
)
