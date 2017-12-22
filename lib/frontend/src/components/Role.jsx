// import './role.sass'

import React from 'react'
import { Helmet } from 'react-helmet'

import { connect } from '../utils'
import Loading from './Loading'

// const b = block('role')

function Role({ roles, error, loading }) {
  const [role] = roles
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
      <article>
        {role.is_in_edition ? (
          <form>
            {/* onSubmit={e => {
             onEdit(role.role_id, e)
           }} */}

            <label>
              Name :
              <input name="role_name" defaultValue={role.role_name} required />
            </label>
            <br />
            <label>
              Purpose :
              <input
                name="role_purpose"
                defaultValue={role.role_purpose}
                required
              />
            </label>
            <br />
            <label>
              Domain :
              <input
                name="role_domain"
                defaultValue={role.role_domain}
                required
              />
            </label>
            <br />
            <label>
              Accountabilities :
              <input
                name="role_accountabilities"
                defaultValue={role.role_accountabilities}
                required
              />
            </label>
            <br />
            <input type="submit" value="Edit role" />
          </form>
        ) : (
          ''
        )}
        <button
          type="submit"
          // onClick={() => editClick()}
        >
          {role.is_in_edition ? 'Cancel' : 'Update'}
        </button>
        <button
          type="submit"
          // onClick={() => {
          //   btnClick(role.role_id)
          // }}
        >
          Delete role
        </button>
        {/* <Link
          to={{
            pathname: '/createrole',
          }}
        > */}
        <button type="submit">Add a Role</button>
        {/* </Link> */}
      </article>
    </section>
  )
}
export default connect(
  state => ({
    roles: state.role.results,
    loading: state.role.loading,
    error: state.role.error,
    users: state.users.results,
  })
  // dispatch => ({})
)(Role)
