import './CreateRole.sass'

import React from 'react'
import { Helmet } from 'react-helmet'
import { withRouter } from 'react-router-dom'

import { fetchResults, goBack, setLoading } from '../actions'
import { fetchCircle } from '../actions/circle'
import { createRole } from '../actions/roles'
import { block, connect } from '../utils'
import Loading from './Loading'
import MarkdownEditor from './Utils/MarkdownEditor'

const b = block('CreateRole')

class CreateRole extends React.Component {
  componentDidMount() {
    this.props.sync()
  }
  render() {
    const { circle, error, history, loading, onGoBack, onSubmit } = this.props

    return (
      <article className={b()}>
        <Helmet>
          <title>Gibolt - Create a role</title>
        </Helmet>
        <div className={b('createRole')}>
          {loading && <Loading />}
          <h2>Create a new role :</h2>
          {error && (
            <article className={b('group', { error: true })}>
              <h3>Error during role creation:</h3>
              <code>{error}</code>
            </article>
          )}
          <label>
            Circle :
            <input name="circle_name" disabled value={circle.circle_name} />
          </label>
          <br />
          <form
            onSubmit={e => {
              e.preventDefault()
              onSubmit(circle.circle_id, e, history)
            }}
          >
            <label>
              Name :
              <input name="role_name" required />
            </label>
            <br />
            <label>
              Purpose :
              <input name="role_purpose" required />
            </label>
            <br />
            <label>
              Domain :
              <MarkdownEditor editorName="role_domain" />
            </label>
            <br />
            <label>
              Accountabilities :
              <MarkdownEditor editorName="role_accountabilities" />
            </label>
            <br />
            <button type="submit">Create role</button>
            <button type="submit" onClick={() => onGoBack(history)}>
              Cancel
            </button>
          </form>
        </div>
      </article>
    )
  }
}

export default withRouter(
  connect(
    state => ({
      circle: state.circle.results,
      error: state.role.error,
      loading: state.circle.loading,
    }),
    dispatch => ({
      onGoBack: history => {
        dispatch(goBack(history))
      },
      onSubmit: (circleId, e, history) => {
        const formRole = [].slice.call(e.target.elements).reduce(
          function(map, obj) {
            if (obj.name && obj.value) {
              map[obj.name] = obj.value
            }
            return map
          },
          { circle_id: circleId }
        )
        dispatch(createRole(formRole, history))
      },
      sync: () => {
        dispatch(setLoading('users'))
        dispatch(fetchResults('users'))
        dispatch(setLoading('circle'))
        dispatch(fetchCircle())
      },
    })
  )(CreateRole)
)
