import './Role.sass'

import React from 'react'
import { Helmet } from 'react-helmet'
import { withRouter } from 'react-router-dom'

import { updateMarkdown, fetchResults, setLoading } from '../../actions'
import {
  deleteRole,
  editRole,
  fetchItems,
  fetchRole,
  fetchRoles,
} from '../../actions/roles'
import { block, connect } from '../../utils'
import RoleFocus from './RoleFocus'
import Loading from './../Loading'
import RoleForm from './../Utils/RoleForm'

var ReactMarkdown = require('react-markdown')

const b = block('Role')
const roleTypes = [
  { value: 'leadlink', name: 'Premier lien' },
  { value: 'elected', name: 'Rôle élu' },
  { value: 'assigned', name: 'Rôle désigné' },
]

class Role extends React.Component {
  constructor(props, context) {
    super(props, context)
    this.state = {
      endDate: null,
    }
  }

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
      btnClick,
      circles,
      editClick,
      error,
      history,
      items,
      loading,
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
          <h1>
            {role.role_name} {role.is_active ? '' : ' (disabled)'}
            <span
              onClick={() => editClick(role.role_accountabilities)}
              title="Edit role"
            >
              <i className="fa fa-pencil-square-o" aria-hidden="true" />
            </span>{' '}
            {items.results.filter(item => item.role_id === role.role_id)
              .length > 0 ? (
              ''
            ) : (
              <span
                onClick={() => btnClick(role.role_id, role.circle_id, history)} // eslint-disable-line max-len
                title="Delete role"
              >
                <i className="fa fa-trash" aria-hidden="true" />
              </span>
            )}
          </h1>
          {items.results.filter(item => item.role_id === role.role_id).length >
          0 ? (
            <code>
              {'You cannot delete this role, '}
              {'please first delete the items.'}
            </code>
          ) : (
            ' '
          )}
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
              circle={{}}
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
              <p>{role.role_domain}</p>
              <h3>Accountabilities</h3>
              <ReactMarkdown source={role.role_accountabilities} />
              <RoleFocus duration={role.duration} focuses={role.role_focuses} />
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
      roles: state.roles.results,
      users: state.users.results,
    }),
    dispatch => ({
      btnClick: (roleId, circleId, history) => {
        dispatch(deleteRole(roleId, circleId, history))
      },
      editClick: content => {
        dispatch(editRole())
        dispatch(updateMarkdown(content))
      },
      onGoBack: (circleId, history) => {
        history.push(`/circle?circle_id=${circleId}`)
      },
      loadItems: () => {
        dispatch(setLoading('items'))
        dispatch(fetchItems())
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
          dispatch(setLoading('roles'))
          dispatch(fetchRoles())
        })
      },
    })
  )(Role)
)
