import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'
import { Link }  from 'redux-little-router'
import { push } from '../actions'
import { block } from '../utils'
import './SelectUser.sass'


const b = block('SelectUser')
function SelectUser({ type, query, users, onChangeUser }) {
  return (
    <select className={ b({ type: type }) } value={ query[type] || '' }
            onChange={ e => onChangeUser(e.target.value, type, query)}>
      <option value="">Anybody</option>
      { users.map(user =>
        <option key={ user } value={ user }>
          { user }
        </option>
      )}
    </select>
  )
}

export default connect(state => ({
  query: state.router.query,
  users: state.users
}), dispatch => ({
  onChangeUser: (user, type, query) => {
    // This seems to be broken as of now in redux-little-router
    // https://github.com/FormidableLabs/redux-little-router/issues/87
    dispatch(push({
      pathname: '/',
      query: {
        ...query,
        [type]: user || undefined
      }
    }))
  }
}))(SelectUser)
