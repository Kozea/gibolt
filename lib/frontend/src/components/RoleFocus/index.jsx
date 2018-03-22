import './RoleFocus.sass'

import { addDays, format } from 'date-fns'
import React from 'react'
import { Helmet } from 'react-helmet'
import { withRouter } from 'react-router-dom'

import { fetchResults, setLoading } from '../../actions'
import {
  deleteFocus,
  editRoleFocus,
  fetchRoleFocus,
} from '../../actions/rolefocus'
import { block, connect } from '../../utils'
import Loading from './../Loading'
import BreadCrumbs from './../Utils/BreadCrumbs'
import RoleFocusForm from './RoleFocusForm'
import RoleFocusItems from './RoleFocusItems'

const b = block('RoleFocus')

class Role extends React.Component {
  componentDidMount() {
    this.props.sync()
  }

  render() {
    const {
      error,
      history,
      isInEdition,
      loading,
      onDelete,
      onEdition,
      roleFocus,
      roles,
      users,
    } = this.props
    const role = roleFocus.role ? roleFocus.role[0] : null
    const circle =
      roleFocus.role && roleFocus.role[0].circle
        ? roleFocus.role[0].circle[0]
        : null
    const focusUser = roleFocus.role_focus_users
      ? roleFocus.role_focus_users[0]
      : null
    return (
      <section className={b()}>
        <Helmet>
          <title>Gibolt - Role Focus</title>
        </Helmet>
        <article className={b('roleFocus')}>
          {loading && <Loading />}
          {error && (
            <article className={b('date', { error: true })}>
              <h2>Error during issue fetch</h2>
              <code>{error}</code>
            </article>
          )}
          <BreadCrumbs circle={circle} role={role} focus={roleFocus} />
          <h1>
            {roleFocus.focus_name ? roleFocus.focus_name : 'No focus name'}{' '}
            {role &&
              role.is_active && (
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
                </span>
              )}
          </h1>
          {isInEdition && role ? (
            <RoleFocusForm
              role={role}
              roleFocus={roleFocus}
              roleFocusUser={focusUser}
              roles={roles}
              users={users}
            />
          ) : (
            <span>
              {roleFocus &&
                focusUser && (
                  <span>
                    <p>
                      <span className={b('focusLabel')}>Role: </span>
                      {role.role_name}
                    </p>
                    <p>
                      <span className={b('focusLabel')}>Filled by: </span>
                      {focusUser.user_name}{' '}
                      <img
                        className={b('avatar')}
                        src={focusUser.avatar_url}
                        alt="avatar"
                        title={focusUser.user_name}
                      />
                    </p>
                    <p>
                      <span className={b('focusLabel')}>From: </span>
                      {focusUser.start_date
                        ? format(new Date(focusUser.start_date), 'DD/MM/YYYY')
                        : 'No start date defined'}
                    </p>
                    <p>
                      <span className={b('focusLabel')}>Until: </span>
                      {focusUser.end_date
                        ? format(new Date(focusUser.end_date), 'DD/MM/YYYY')
                        : focusUser.start_date && role.duration
                          ? `${format(
                              addDays(
                                new Date(focusUser.start_date),
                                role.duration
                              ),
                              'DD/MM/YYYY'
                            )}  (calculated)`
                          : '∞'}
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
  )(Role)
)
