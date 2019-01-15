import './User.sass'

import block from 'bemboo'
import React from 'react'

import { fetchResults, setLoading } from '../actions'
import { connect } from '../utils'
import SelectUser from './SelectUser'

@block
class User extends React.Component {
  componentDidMount() {
    const { loadUsers } = this.props
    loadUsers()
  }

  render(b) {
    return (
      <div className={b}>
        <h3>Assignee</h3>
        <SelectUser type="assignee" />
        <h3>Involves</h3>
        <SelectUser type="involves" />
      </div>
    )
  }
}

export default connect(
  () => ({}),
  dispatch => ({
    loadUsers: () => {
      dispatch(setLoading('users'))
      dispatch(fetchResults('users'))
    },
  })
)(User)
