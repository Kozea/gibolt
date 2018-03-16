import './CreateRole.sass'

import { addDays, format } from 'date-fns'
import React from 'react'
import { Helmet } from 'react-helmet'
import { withRouter } from 'react-router-dom'

import { fetchResults, goBack, setLoading, updateMarkdown } from '../actions'
import { fetchCircle } from '../actions/circle'
import { createRole } from '../actions/roles'
import { block, connect } from '../utils'
import Loading from './Loading'
import MarkdownEditor from './Utils/MarkdownEditor'

const b = block('CreateRole')

const roleTypes = [
  { value: 'leadlink', name: 'Premier lien' },
  { value: 'elected', name: 'Rôle élu' },
  { value: 'assigned', name: 'Rôle désigné' },
]

class CreateRole extends React.Component {
  constructor(props, context) {
    super(props, context)
    this.state = {
      endDate: null,
    }
  }

  componentDidMount() {
    this.props.sync()
  }

  calculateEndDate(duration) {
    this.setState({
      endDate:
        duration || duration !== 0
          ? format(addDays(new Date(), duration), 'DD/MM/YYYY (dddd)')
          : null,
    })
  }

  render() {
    const {
      circle,
      error,
      history,
      loading,
      onGoBack,
      onSubmit,
      users,
    } = this.props
    const { endDate } = this.state

    return (
      <article className={b()}>
        <Helmet>
          <title>Gibolt - Create a role</title>
        </Helmet>
        {loading && <Loading />}
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
          <form
            onSubmit={e => {
              e.preventDefault()
              onSubmit(circle.circle_id, e, history)
            }}
          >
            <label>
              Type :
              <select name="role_type" defaultValue="" required>
                <option value="" />
                {roleTypes.map(roleType => (
                  <option key={roleType.value} value={roleType.value}>
                    {roleType.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Name :
              <input name="role_name" required />
            </label>
            <label>
              Focus :
              <input name="role_name" required />
            </label>
            <label>
              User :
              <select name="user_id" defaultValue="">
                <option value="" />
                {users.map(user => (
                  <option key={user.user_id} value={user.user_id}>
                    {user.user_name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Duration (in days) :
              <span className={b('duration')}>
                <input
                  onChange={e => this.calculateEndDate(+e.target.value)}
                  name="duration"
                  type="number"
                />
                <span className={b('endDate')}>
                  {endDate && `until ${endDate}`}
                </span>
              </span>
            </label>
            <label>
              Purpose :
              <input name="role_purpose" required />
            </label>
            <label>
              Domain :
              <MarkdownEditor editorName="role_domain" />
            </label>
            <label>
              Accountabilities :
              <MarkdownEditor editorName="role_accountabilities" />
            </label>
            <button type="submit">Create role</button>
            <button type="button" onClick={() => onGoBack(history)}>
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
      users: state.users.results,
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
        dispatch(updateMarkdown(''))
        dispatch(setLoading('users'))
        dispatch(fetchResults('users'))
        dispatch(setLoading('circle'))
        dispatch(fetchCircle(null, true))
      },
    })
  )(CreateRole)
)
