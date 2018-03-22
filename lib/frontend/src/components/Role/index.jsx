import './Role.sass'

import React from 'react'
import { Helmet } from 'react-helmet'
import { withRouter } from 'react-router-dom'

import { fetchResults, setLoading } from '../../actions'
import { disableRole, editRole, fetchRole } from '../../actions/roles'
import { block, connect, roleTypes } from '../../utils'
import RoleFocus from './RoleFocus'
import Loading from './../Loading'
import BreadCrumbs from './../Utils/BreadCrumbs'
import RoleForm from './../Utils/RoleForm'

var ReactMarkdown = require('react-markdown')

const b = block('Role')

class Role extends React.Component {
  componentDidMount() {
    this.props.sync()
  }

  componentWillReceiveProps(nextProps) {
    if (
      (nextProps.location.pathname !== this.props.location.pathname &&
        nextProps.location.pathname === '/role') ||
      (nextProps.location.pathname === this.props.location.pathname &&
        nextProps.location.search !== this.props.location.search)
    ) {
      this.props.sync()
    }
  }

  render() {
    const {
      circles,
      editClick,
      error,
      history,
      loading,
      onDisableRole,
      onGoBack,
      role,
      users,
    } = this.props
    return (
      <section className={b()}>
        <Helmet>
          <title>Gibolt - Role</title>
        </Helmet>

        <article className={b('role')}>
          <BreadCrumbs
            circle={circles.find(circle => circle.circle_id === role.circle_id)}
            role={role}
          />
          <h1>
            {role.role_name} {role.is_active ? '' : ' (disabled)'}
            <span onClick={() => editClick()} title="Edit role">
              <i className="fa fa-pencil-square-o" aria-hidden="true" />
            </span>{' '}
            <span
              onClick={e => {
                e.preventDefault()
                onDisableRole(role)
              }}
              title={role.is_active ? 'Disable role' : 'Enable role'}
            >
              {role.is_active ? (
                <i className="fa fa-ban" aria-hidden="true" />
              ) : (
                <i className="fa fa-unlock" aria-hidden="true" />
              )}
            </span>
          </h1>
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
            <RoleForm
              circleId={role.circle_id}
              circles={circles}
              isCreation={false}
              role={role}
              users={users}
            />
          ) : (
            <article>
              <h3>Circle</h3>
              <p>
                {circles.find(circle => circle.circle_id === role.circle_id) &&
                  circles.find(circle => circle.circle_id === role.circle_id)
                    .circle_name}
              </p>
              <h3>Role Type</h3>
              <p>
                {role.role_type
                  ? roleTypes
                      .filter(roleType => roleType.value === role.role_type)
                      .map(roleType => roleType.name)
                      .toString()
                  : 'Type not defined'}
              </p>
              <h3>Duration</h3>
              <p>
                {role.duration
                  ? `${role.duration} day(s)`
                  : 'Duration not defined'}
              </p>
              <h3>Purpose</h3>
              <p>{role.role_purpose}</p>
              <h3>Domain</h3>
              <ReactMarkdown source={role.role_domain} />
              <h3>Accountabilities</h3>
              <ReactMarkdown source={role.role_accountabilities} />
              <RoleFocus
                duration={role.duration}
                focuses={role.role_focuses}
                isActive={role.is_active}
                roleId={role.role_id}
                users={users}
              />
              <button
                type="submit"
                onClick={() => onGoBack(role.circle_id, history)}
              >
                Back to circle
              </button>
            </article>
          )}
        </article>
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
      location: state.router.location,
      role: state.role.results,
      users: state.users.results,
    }),
    dispatch => ({
      editClick: () => {
        dispatch(editRole())
      },
      onDisableRole: role => {
        dispatch(disableRole(role))
      },
      onGoBack: (circleId, history) => {
        history.push(`/circle?circle_id=${circleId}`)
      },
      sync: () => {
        Promise.all([
          dispatch(setLoading('users')),
          dispatch(fetchResults('users')),
        ]).then(() => {
          dispatch(setLoading('circles'))
          dispatch(fetchResults('circles'))
          dispatch(setLoading('role'))
          dispatch(fetchRole())
        })
      },
    })
  )(Role)
)
