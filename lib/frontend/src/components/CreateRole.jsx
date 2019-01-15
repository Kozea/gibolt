import './CreateRole.sass'

import block from 'bemboo'
import React from 'react'
import { Helmet } from 'react-helmet'

import { fetchResults, setLoading } from '../actions'
import { fetchCircle } from '../actions/circle'
import { connect } from '../utils'
import Loading from './Loading'
import RoleForm from './Utils/RoleForm'

@block
class CreateRole extends React.Component {
  componentDidMount() {
    this.props.sync()
  }

  render(b) {
    const { circle, circles, error, loading, users } = this.props
    return (
      <article className={b}>
        <Helmet>
          <title>Gibolt - Create a role</title>
        </Helmet>
        {loading && <Loading />}
        <div className={b.e('createRole')}>
          {loading && <Loading />}
          <h2>Create a new role :</h2>
          {error && (
            <article className={b('group').m({ error: true })}>
              <h3>Error during role creation:</h3>
              <code>{error}</code>
            </article>
          )}
          {circle.circle_id && circles.length > 0 && (
            <RoleForm
              circleId={circle.circle_id}
              circles={circles}
              isCreation
              role={{}}
              users={users}
            />
          )}
        </div>
      </article>
    )
  }
}

export default connect(
  state => ({
    circle: state.circle.results,
    circles: state.circles.results,
    error: state.role.error,
    loading: state.circle.loading,
    users: state.users.results,
  }),
  dispatch => ({
    sync: () => {
      dispatch(setLoading('circle'))
      dispatch(fetchCircle(null, true))
      dispatch(setLoading('users'))
      dispatch(fetchResults('users'))
      dispatch(setLoading('circles'))
      dispatch(fetchResults('circles'))
    },
  })
)(CreateRole)
