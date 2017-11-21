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
      {users.map(user => (
        <option key={user} value={user}>
          {user}
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
    users: state.users,
  }),
  dispatch => ({
    onChangeUser: (user, type, query) => {
      // This seems to be broken as of now in redux-little-router
      // https://github.com/FormidableLabs/redux-little-router/issues/87
      dispatch(
        push({
          pathname: '/',
          search: stringify({
            ...query,
            [type]: user || (type === 'assignee' ? user : void 0),
          }),
        })
      )
    },
  })
)(SelectUser)
