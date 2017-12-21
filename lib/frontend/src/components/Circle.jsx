import './Circle.sass'

import React from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'

import { block, circleNameFromState, connect } from '../utils'
import {
  toggleAccountExpanded,
  toggleDomainExpanded,
  togglePurposeExpanded,
  updateCircle,
  deleteCircle,
} from '../actions/circle'
import { editCircle } from '../actions'
import Loading from './Loading'

const b = block('Circle')

function getUserInfo(roleUser, user) {
  if (roleUser === user.user_id) {
    return user
  }
}

function Circle({
  circle,
  circles,
  circlename,
  error,
  loading,
  users,
  onClickAccount,
  onClickDomain,
  onClickPurpose,
  onEdit,
  btnClick,
  editClick,
}) {
  return (
    <section className={b()}>
      <Helmet>
        <title>Gibolt - Circle</title>
      </Helmet>
      <h1>{circlename}</h1>
      {circle.parent_circle_name && (
        <span>
          {circle.parent_circle_name
            ? `(sous-cercle de "${circle.parent_circle_name}")`
            : ''}
        </span>
      )}
      {error && (
        <article className={b('group', { error: true })}>
          <h2>Error during issue fetch</h2>
          {typeof error === 'object' ? (
            <ul>
              {error.map(err => (
                <li key={err.id}>
                  <span className={b('bullet')} />
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
      <article>
        <h3>Purpose</h3>
        <div onClick={() => onClickPurpose(circle.purpose_expanded)}>
          {circle.purpose_expanded ? (
            <p>{circle.circle_purpose}</p>
          ) : (
            <span>show purpose</span>
          )}
        </div>
        <h3>Domains</h3>
        <div onClick={() => onClickDomain(circle.domain_expanded)}>
          {circle.domain_expanded ? (
            <p>{circle.circle_domain}</p>
          ) : (
            <span>show domain</span>
          )}
        </div>
        <h3>Accountabilities</h3>
        <div onClick={() => onClickAccount(circle.accountabilities_expanded)}>
          {circle.accountabilities_expanded ? (
            <p>{circle.circle_accountabilities}</p>
          ) : (
            <span>show accountabilities</span>
          )}
        </div>
      </article>
      <article>
        <h3>Rôles</h3>
        {circle.roles && circle.roles.length > 0 ? (
          <ul>
            {circle.roles.map(role => (
              <li key={role.role_id} className={b('role')}>
                <span className={b('bullet')} />
                {role.role_name} :{' '}
                <img
                  key={role.user_id}
                  className={b('avatar')}
                  src={users
                    .filter(user => getUserInfo(role.user_id, user))
                    .map(user => user.avatar_url)
                    .toString()}
                  alt="avatar"
                  title={users
                    .filter(user => getUserInfo(role.user_id, user))
                    .map(user => user.user_name)
                    .toString()}
                />
                {'  '}
                {users
                  .filter(user => getUserInfo(role.user_id, user))
                  .map(user => user.user_name)
                  .toString()}
              </li>
            ))}
          </ul>
        ) : (
          <span>No roles defined</span>
        )}
      </article>
      <br />
      <article className={b('action')}>
        {circle.is_in_edition ? (
          <form
            onSubmit={e => {
              onEdit(circle.circle_id, e)
            }}
          >
            <label>
              Name :
              <input
                name="circle_name"
                defaultValue={circle.circle_name}
                required
              />
            </label>
            <br />
            <label>
              Parent :
              <select
                name="parent_circle_id"
                defaultValue={circle.parent_circle_id}
              >
                {circles
                  .filter(cercle => cercle.parent_circle_id === null)
                  .map(cercle => (
                    <option key={cercle.circle_id} value={cercle.circle_id}>
                      {cercle.circle_name}
                    </option>
                  ))}
                <option value="">Aucun</option>
              </select>
            </label>
            <br />
            <label>
              Purpose :
              <input
                name="circle_purpose"
                defaultValue={circle.circle_purpose}
                required
              />
            </label>
            <br />
            <label>
              Domain :
              <input
                name="circle_domain"
                defaultValue={circle.circle_domain}
                required
              />
            </label>
            <br />
            <label>
              Accountabilities :
              <input
                name="circle_accountabilities"
                defaultValue={circle.circle_accountabilities}
                required
              />
            </label>
            <br />
            <input type="submit" value="Edit circle" />
          </form>
        ) : (
          ''
        )}
        <button type="submit" onClick={() => editClick()}>
          {circle.is_in_edition ? 'Cancel' : 'Update'}
        </button>
        <button
          type="submit"
          onClick={() => {
            btnClick(circle.circle_id)
          }}
        >
          Delete Circle
        </button>
        <Link
          to={{
            pathname: '/createrole',
          }}
        >
          <button type="submit">Add a Role</button>
        </Link>
      </article>
    </section>
  )
}
export default connect(
  state => ({
    circle: state.circle.results,
    circles: state.circles.results,
    loading: state.circle.loading,
    error: state.circle.error,
    circlename: circleNameFromState(state).name,
    users: state.users.results,
  }),
  dispatch => ({
    onClickAccount: circleAccount => {
      dispatch(toggleAccountExpanded(circleAccount))
    },
    onClickDomain: circleDomain => {
      dispatch(toggleDomainExpanded(circleDomain))
    },
    onClickPurpose: circlePurpose => {
      dispatch(togglePurposeExpanded(circlePurpose))
    },
    onEdit: (id, e) => {
      const formCircle = [].slice
        .call(e.target.elements)
        .reduce(function(map, obj) {
          if (obj.name) {
            map[obj.name] = obj.value
          }

          return map
        }, {})
      // e.preventDefault()
      dispatch(updateCircle(id, formCircle))
    },
    btnClick: data => {
      return dispatch(deleteCircle(data))
    },
    editClick: () => {
      return dispatch(editCircle())
    },
  })
)(Circle)
