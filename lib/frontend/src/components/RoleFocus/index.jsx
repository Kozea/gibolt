import './RoleFocus.sass'

import block from 'bemboo'
import { addDays, format, isFuture } from 'date-fns'
import React from 'react'
import { Helmet } from 'react-helmet'
import { withRouter } from 'react-router-dom'

import { fetchResults, setLoading } from '../../actions'
import {
  addFocusUser,
  deleteFocus,
  editRoleFocus,
  fetchRoleFocus,
} from '../../actions/rolefocus'
import { connect } from '../../utils'
import Loading from './../Loading'
import BreadCrumbs from './../Utils/BreadCrumbs'
import RoleFocusEndDate from './../Utils/RoleFocusEndDate'
import RoleFocusForm from './RoleFocusForm'
import RoleFocusItems from './RoleFocusItems'
import RoleFocusUsersList from './RoleFocusUsersList'

@block
class RoleFocus extends React.Component {
  constructor(props, context) {
    super(props, context)
    this.state = {
      displayForm: null,
    }
  }
  componentDidMount() {
    this.props.sync()
  }

  render(b) {
    const {
      error,
      history,
      isInEdition,
      loading,
      onAddUser,
      onDelete,
      onEdition,
      roleFocus,
      roles,
      users,
    } = this.props
    const { displayForm } = this.state
    const role = roleFocus.role ? roleFocus.role[0] : null
    const circle =
      roleFocus.role && roleFocus.role[0].circle
        ? roleFocus.role[0].circle[0]
        : null
    const focusUser = roleFocus.role_focus_users
      ? roleFocus.role_focus_users[0]
      : null
    return (
      <section className={b}>
        <Helmet>
          <title>Gibolt - Role Focus</title>
        </Helmet>
        {loading && <Loading />}
        <article className={b.e('roleFocus')}>
          <BreadCrumbs circle={circle} role={role} focus={roleFocus} />
          {error ? (
            <article className={b.e('date').m({ error: true })}>
              <h2>Error during role focus fetch</h2>
              <code>{error}</code>
            </article>
          ) : isInEdition && role ? (
            <span>
              <h1>
                {roleFocus.focus_name ? roleFocus.focus_name : 'No focus name'}
              </h1>
              <RoleFocusForm
                role={role}
                roleFocus={roleFocus}
                roleFocusUser={focusUser}
                roles={roles}
                users={users}
              />
            </span>
          ) : (
            <span>
              <h1>
                {roleFocus.focus_name ? roleFocus.focus_name : 'No focus name'}
                {role && role.is_active && (
                  <span>
                    <span onClick={() => onEdition()} title="Edit role focus">
                      <i className="fa fa-pencil-square-o" aria-hidden="true" />
                    </span>
                    <span
                      onClick={e => {
                        e.preventDefault()
                        onDelete(roleFocus, history)
                      }}
                      title="Delete Focus"
                    >
                      <i className="fa fa-trash" aria-hidden="true" />
                    </span>
                    {!isFuture(new Date(focusUser.start_date)) && (
                      <span
                        onClick={() => {
                          this.setState({ displayForm: true })
                        }}
                        title="Add user"
                      >
                        <i className="fa fa-plus-circle" aria-hidden="true" />
                      </span>
                    )}
                  </span>
                )}
              </h1>
              {roleFocus && focusUser && (
                <span>
                  <p>
                    <span className={b.e('focusLabel')}>Role: </span>
                    {role.role_name}
                  </p>
                  <p>
                    <span className={b.e('focusLabel')}>
                      Duration (in days):{' '}
                    </span>
                    {roleFocus.duration
                      ? roleFocus.duration
                      : 'No duration defined'}
                  </p>
                  <p>
                    <span className={b.e('focusLabel')}>Filled by: </span>
                    {focusUser.user_name}{' '}
                    <img
                      className={b.e('avatar')}
                      src={focusUser.avatar_url}
                      alt="avatar"
                      title={focusUser.user_name}
                    />
                  </p>
                  <p>
                    <span className={b.e('focusLabel')}>From: </span>
                    {focusUser.start_date
                      ? format(new Date(focusUser.start_date), 'DD/MM/YYYY')
                      : 'No start date defined'}
                  </p>
                  <p>
                    <span className={b.e('focusLabel')}>Until: </span>
                    {focusUser.end_date
                      ? format(new Date(focusUser.end_date), 'DD/MM/YYYY')
                      : focusUser.start_date && roleFocus.duration
                      ? `${format(
                          addDays(
                            new Date(focusUser.start_date),
                            roleFocus.duration
                          ),
                          'DD/MM/YYYY'
                        )}  (calculated)`
                      : '∞'}
                    <RoleFocusEndDate
                      displayDate={false}
                      duration={roleFocus.duration}
                      focusUser={focusUser}
                    />
                  </p>
                  <br />
                  <RoleFocusItems
                    items={roleFocus.actions}
                    itemType="checklist"
                    title="Recurrent actions"
                    roleFocus={roleFocus}
                    roles={roles}
                  />
                  <br />
                  <RoleFocusItems
                    items={roleFocus.indicators}
                    itemType="indicator"
                    title="Indicators"
                    roleFocus={roleFocus}
                    roles={roles}
                  />
                  <br />
                  <RoleFocusUsersList
                    currentUserId={focusUser.role_focus_user_id}
                    roleFocusUsers={roleFocus.role_focus_users}
                  />
                  <br />
                  {displayForm && (
                    <span>
                      <h4>Add a user</h4>
                      <form
                        onSubmit={e => {
                          e.preventDefault()
                          onAddUser(e, roleFocus.role_focus_id)
                          this.setState({ displayForm: false })
                        }}
                      >
                        <label>
                          User :
                          <select
                            className={b.e('long')}
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
                          Start date:
                          <span className={b.e('duration')}>
                            <input
                              defaultValue=""
                              name="start_date"
                              onChange={e => {
                                this.setState({ startDate: e.target.value })
                              }}
                              type="date"
                            />
                          </span>
                        </label>
                        <button type="submit">Add</button>
                        <button
                          type="button"
                          onClick={() => this.setState({ displayForm: false })}
                        >
                          Cancel
                        </button>
                      </form>
                    </span>
                  )}
                </span>
              )}
            </span>
          )}
        </article>
      </section>
    )
  }
}

export default withRouter(
  connect(
    state => ({
      error: state.roleFocus.error,
      isInEdition: state.roleFocus.is_in_edition,
      loading: state.roleFocus.loading,
      roleFocus: state.roleFocus.results,
      roles: state.roles.results,
      users: state.users.results,
    }),
    dispatch => ({
      onAddUser: (e, roleFocusId) => {
        const formFocusUser = [].slice.call(e.target.elements).reduce(
          function(map, obj) {
            if (obj.name && obj.value) {
              map[obj.name] = obj.value
            }
            return map
          },
          { role_focus_id: roleFocusId }
        )
        dispatch(addFocusUser(formFocusUser))
      },
      onDelete: (roleFocus, history) => {
        dispatch(deleteFocus(roleFocus, history))
      },
      onEdition: () => {
        dispatch(editRoleFocus(true))
      },
      sync: () => {
        Promise.all([
          dispatch(setLoading('users')),
          dispatch(fetchResults('users')),
        ]).then(() => {
          dispatch(setLoading('roleFocus'))
          dispatch(fetchRoleFocus(true))
        })
      },
    })
  )(RoleFocus)
)
