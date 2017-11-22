import './SelectUser.sass'

import { parse, stringify } from 'query-string'
import React from 'react'
import { push } from 'react-router-redux'

import { block, connect, usersFromState } from '../utils'

const b = block('SelectUser')

function SelectUser({ type, query, users, values, onChangeUser }) {
  return (
    <select
      className={b({ type: type })}
      value={values[type][0]}
      onChange={e => onChangeUser(e.target.value, type, query)}
    >
      <option value="">Anybody</option>
      {users.map(({ id, login }) => (
        <option key={id} value={login}>
          {login}
        </option>
      ))}
    </select>
  )
}

export default connect(
  state => ({
    query: parse(state.router.location.search),
    values: usersFromState(state),
    user: state.user,
    users: state.users.results,
  }),
  dispatch => ({
    onChangeUser: (user, type, query) => {
      dispatch(
        push({
          pathname: '/',
          search: stringify({
            ...query,
            [type]: user.login || (type === 'assignee' ? user.login : void 0),
          }),
        })
      )
    },
  })
)(SelectUser)
