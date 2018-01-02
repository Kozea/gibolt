import './Circle.sass'

import { stringify } from 'query-string'
import React from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'

import { block, connect } from '../utils'
import {
  toggleAccountExpanded,
  toggleDomainExpanded,
  togglePurposeExpanded,
} from '../actions/circle'
import Loading from './Loading'

const b = block('Circle')

function getUserInfo(roleUser, user) {
  if (roleUser === user.user_id) {
    return user
  }
}

function Circle({
  circle,
  error,
  loading,
  meetingsTypes,
  users,
  onClickAccount,
  onClickDomain,
  onClickPurpose,
}) {
  return (
    <section className={b()}>
      <Helmet>
        <title>Gibolt - Circle</title>
      </Helmet>
      {error && (
        <article className={b('group', { error: true })}>
          <h2>Error during circle fetch</h2>
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
      {circle.circle_name && (
        <div>
          <h1>{circle.circle_name}</h1>
          {circle.parent_circle_name && (
            <span>
              {circle.parent_circle_name
                ? `(sous-cercle de "${circle.parent_circle_name}")`
                : ''}
            </span>
          )}

          {loading && <Loading />}
          <article>
            <h4>Purpose</h4>
            <div onClick={() => onClickPurpose(circle.purpose_expanded)}>
              {circle.purpose_expanded ? (
                <p>{circle.circle_purpose}</p>
              ) : (
                <span>show purpose</span>
              )}
            </div>
            <h4>Domains</h4>
            <div onClick={() => onClickDomain(circle.domain_expanded)}>
              {circle.domain_expanded ? (
                <p>{circle.circle_domain}</p>
              ) : (
                <span>show domain</span>
              )}
            </div>
            <h4>Accountabilities</h4>
            <div
              onClick={() => onClickAccount(circle.accountabilities_expanded)}
            >
              {circle.accountabilities_expanded ? (
                <p>{circle.circle_accountabilities}</p>
              ) : (
                <span>show accountabilities</span>
              )}
            </div>
          </article>
          <article className={b('action')}>
            <button type="submit">Update Circle</button>
            <button type="submit">Delete Circle</button>
          </article>

          <article>
            <h3>Meetings</h3>
            {meetingsTypes.map(type => (
              <Link
                className={b('link')}
                key={type.type_id}
                to={{
                  pathname: '/meetings',
                  search: stringify({
                    circle_id: circle.circle_id,
                    meeting_name: type.type_name,
                  }),
                }}
              >
                <button key={type.type_id} type="submit">
                  {type.type_name}
                </button>
              </Link>
            ))}
          </article>

          <article>
            <h3>Roles</h3>
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
        </div>
      )}
      <article className={b('action')}>
        <button type="submit">Add a Role</button>
      </article>
    </section>
  )
}
export default connect(
  state => ({
    circle: state.circle.results,
    error: state.circle.error,
    loading: state.circle.loading,
    meetingsTypes: state.meetingsTypes.results,
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
  })
)(Circle)
