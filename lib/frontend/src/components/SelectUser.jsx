import './SelectUser.sass'

import block from 'bemboo'
import { parse, stringify } from 'query-string'
import React from 'react'
import { push } from 'react-router-redux'

import { connect, usersFromState } from '../utils'

const b = block('SelectUser')

function SelectUser({ type, query, users, values, onChangeUser }) {
  return (
    <select
      className={b.m({ type: type })}
      value={values[type][0]}
      onChange={e => onChangeUser(e.target.value, type, query)}
    >
      <option value="">Anybody</option>
      {users.map(user => (
        <option key={user.user_id} value={user.user_name}>
          {user.user_name}
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
    onChangeUser: (login, type, query) => {
      dispatch(
        push({
          pathname: '/',
          search: stringify({
            ...query,
            [type]: login || (type === 'assignee' ? login : void 0),
          }),
        })
      )
    },
  })
)(SelectUser)
