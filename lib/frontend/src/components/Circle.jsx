import './Circle.sass'

import { stringify } from 'query-string'
import React from 'react'
import { Helmet } from 'react-helmet'
import { Link, withRouter } from 'react-router-dom'

import { block, connect } from '../utils'
import {
  deleteCircle,
  toggleAccountExpanded,
  toggleDomainExpanded,
  togglePurposeExpanded,
  updateCircle,
} from '../actions/circle'
import { editCircle, checkAcc } from '../actions'
import Loading from './Loading'
import MarkdownEditor from './MarkdownEditor'

const b = block('Circle')
var ReactMarkdown = require('react-markdown')

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
  meetingsTypes,
  users,
  onClickAccount,
  onClickDomain,
  onClickPurpose,
  onEdit,
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
      <article className={b('circle')}>
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
            {circle.is_in_edition ? (
              ''
            ) : (
              <div>
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
                    onClick={() =>
                      onClickAccount(circle.accountabilities_expanded)
                    }
                  >
                    {circle.accountabilities_expanded ? (
                      <ReactMarkdown source={circle.circle_accountabilities} />
                    ) : (
                      <span>show accountabilities</span>
                    )}
                  </div>
                </article>
                <article>
                  {(circle.roles && circle.roles.length > 0) ||
                  circle.nb_reports > 0 ? (
                    <span>
                      <button type="submit" disabled>
                        Delete
                      </button>
                      <br />
                      <code>
                        {'You cannot delete this circle, '}
                        {circle.nb_reports > 0 ? (
                          <code>{'meetings reports exist.'}</code>
                        ) : (
                          <code>{'please first delete the roles.'}</code>
                        )}
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
                      Delete
                    </button>
                  )}
                </article>
                <article>
                  <h3>Meetings</h3>
                  {meetingsTypes.map(type => (
                    <Link
                      className={b('link')}
                      key={type.type_id}
                      to={{
                        pathname: '/createReport',
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
                  <h3>Reports</h3>
                  <Link
                    className={b('link')}
                    to={{
                      pathname: '/meetings',
                      search: stringify({
                        circle_id: circle.circle_id,
                      }),
                    }}
                  >
                    View all reports
                  </Link>
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
          </div>
        )}
        <article>
          {circle.is_in_edition ? (
            <form
              onSubmit={e => {
                e.preventDefault()
                onEdit(circle.circle_id, e)
              }}
            >
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
                <select name="parent_circle_id">
                  {circle.parent_circle_id === null ? (
                    <option value=""> Aucun </option>
                  ) : (
                    <option
                      value={circle.parent_circle_id}
                      defaultValue={circle.parent_circle_id}
                    >
                      {circle.parent_circle_name}
                    </option>
                  )}
                  {circles.results
                    .filter(cercle => cercle.circle_id !== circle.circle_id)
                    .map(cercle => (
                      <option key={cercle.circle_id} value={cercle.circle_id}>
                        {cercle.circle_name}
                      </option>
                    ))}
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
                <MarkdownEditor />
              </label>
              <br />
              <input type="submit" value="Edit circle" />
            </form>
          ) : (
            ''
          )}
          <button
            type="submit"
            onClick={() => editClick(circle.circle_accountabilities)}
          >
            {circle.is_in_edition ? 'Cancel' : 'Update'}
          </button>
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
          {circle.children_circles && circle.children_circles.length > 0 ? (
            <article>
              <h3>Sub-circles</h3>
              <ul>
                {circle.children_circles &&
                  circle.children_circles.map(child => (
                    <li key={child.circle_id}>
                      <span className={b('bullet')} />
                      <Link
                        to={{
                          pathname: '/circle',
                          search: stringify({ circle_id: child.circle_id }),
                        }}
                      >
                        {child.circle_name}
                      </Link>
                    </li>
                  ))}
              </ul>
            </article>
          ) : (
            ''
          )}
        </article>
      </article>
    </section>
  )
}
export default withRouter(
  connect(
    state => ({
      circle: state.circle.results,
      circles: state.circles,
      error: state.circle.error,
      loading: state.circle.loading,
      markvalue: state.markvalue,
      meetingsTypes: state.meetingsTypes.results,
      users: state.users.results,
    }),
    dispatch => ({
      btnClick: data => {
        dispatch(deleteCircle(data))
      },
      editClick: content => {
        dispatch(editCircle())
        dispatch(checkAcc(content))
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
            if (obj.name === 'body') {
              map.circle_accountabilities = obj.value
            } else if (obj.name) {
              map[obj.name] = obj.value
            }

            return map
          }, {})
        } else {
          formCircle = [].slice
            .call(e.target.elements)
            .reduce(function(map, obj) {
              if (obj.name === 'markdown') {
                map.circle_accountabilities = obj.value
              } else if (obj.name) {
                map[obj.name] = obj.value
              }

              return map
            }, {})
        }
        dispatch(updateCircle(id, formCircle))
        dispatch(checkAcc(''))
      },
    })
  )(Circle)
)
