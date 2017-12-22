import './Circle.sass'

import React from 'react'
import { Helmet } from 'react-helmet'

// import { Link } from 'react-router-dom'
//
import { connect } from '../utils'
// import {
//   toggleAccountExpanded,
//   toggleDomainExpanded,
//   togglePurposeExpanded,
//   updateCircle,
//   deleteCircle,
// } from '../actions/circle'
// import { editCircle } from '../actions'
import Loading from './Loading'

// const b = block('Circle')

function Circle({ role, error, loading }) {
  return (
    <section>
      <Helmet>
        <title>Gibolt - Role</title>
      </Helmet>
      <h1>{role.role_name}</h1>
      {error && (
        <article>
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
      {console.log('role')}
      {console.log(role)}
      {console.log('role.role_id')}
      {console.log(role.role_id)}
      <article>
        <h3>Purpose</h3>
        <div>
          <p>{role.role_purpose}</p>
        </div>
        <h3>Domains</h3>
        <div>
          <p>{role.role_domain}</p>
        </div>
        <h3>Accountabilities</h3>
        <div>
          <p>{role.role_accountabilities}</p>
        </div>
      </article>
      <br />
      {/* <article className={b('action')}>
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
      </article> */}
    </section>
  )
}
export default connect(
  state => ({
    role: state.role.results,
    roles: state.roles.results,
    loading: state.circle.loading,
    error: state.circle.error,
    users: state.users.results,
  })
  // dispatch => ({})
)(Circle)
