import './Circle.sass'

import { stringify } from 'query-string'
import React from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'

import { block, connect } from '../utils'
import {
  deleteCircle,
  toggleAccountExpanded,
  toggleDomainExpanded,
  togglePurposeExpanded,
  updateCircle,
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
  btnClick,
  circle,
  circles,
  editClick,
  error,
  loading,
  users,
  onClickAccount,
  onClickDomain,
  onClickPurpose,
  onEdit,
  onGoBack,
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
          <article>
            <h3>Rôles</h3>
            {circle.roles && circle.roles.length > 0 ? (
              <ul>
                {circle.roles.map(role => (
                  <li key={role.role_id} className={b('role')}>
                    <span className={b('bullet')} />
                    <Link
                      to={{
                        pathname: '/role',
                        search: stringify({ id: role.role_id }),
                      }}
                    >
                      {role.role_name}
                    </Link>{' '}
                    :{' '}
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
        {circle.is_in_edition ? (
          <form
            onSubmit={e => {
              e.preventDefault()
              onEdit(circle.circle_id, e)
            }}
          >
            <br />
            <h1>Edit {circle.circle_name} circle :</h1>
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
              <select name="parent_circle_id" required>
                <option>{''}</option>
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
        {circle.is_in_edition ? (
          <button type="submit" onClick={() => onGoBack()}>
            Cancel
          </button>
        ) : (
          <button type="submit" onClick={() => editClick()}>
            Update
          </button>
        )}
        {circle.roles && circle.roles.length > 0 ? (
          <span>
            <button type="submit" disabled>
              Delete Circle
            </button>
            <code>
              You cannot delete this circle, please first delete the roles.
            </code>
          </span>
        ) : (
          <button
            type="submit"
            onClick={e => {
              e.preventDefault()
              btnClick(circle.circle_id)
            }}
          >
            Delete Circle
          </button>
        )}
        <Link
          to={{
            pathname: '/createrole',
            search: stringify({ circle_id: circle.circle_id }),
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
    error: state.circle.error,
    loading: state.circle.loading,
    users: state.users.results,
  }),
  dispatch => ({
    btnClick: data => {
      dispatch(deleteCircle(data))
    },
    editClick: () => {
      dispatch(editCircle())
    },
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
      let formCircle = []
      if (e.target.elements[1].value === '') {
        formCircle = [
          e.target.elements[0],
          e.target.elements[2],
          e.target.elements[3],
          e.target.elements[4],
          e.target.elements[5],
        ].reduce(function(map, obj) {
          if (obj.name) {
            map[obj.name] = obj.value
          }

          return map
        }, {})
      } else {
        formCircle = [].slice
          .call(e.target.elements)
          .reduce(function(map, obj) {
            if (obj.name) {
              map[obj.name] = obj.value
            }

            return map
          }, {})
      }
      dispatch(updateCircle(id, formCircle))
    },
    onGoBack: () => {
      history.go(-1)
    },
  })
)(Circle)
