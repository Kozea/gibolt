import './Circle.sass'

import block from 'bemboo'
import React from 'react'
import { Helmet } from 'react-helmet'
import { withRouter } from 'react-router-dom'

import { fetchResults, setLoading } from '../../actions'
import { fetchCircle } from '../../actions/circle'
import { connect } from '../../utils'
import Loading from './../Loading'
import CircleDetails from './CircleDetails'
import CircleMeetings from './CircleMeetings'
import CircleMilestones from './CircleMilestones'
import CircleRoles from './CircleRoles'
import CircleSubCircles from './CircleSubCircles'

@block
class Circle extends React.Component {
  componentDidMount() {
    if (this.props.location.pathname === '/circle') {
      this.props.sync()
    }
  }

  componentDidUpdate(prevProps) {
    if (
      (this.props.location.pathname !== prevProps.location.pathname &&
        this.props.location.pathname === '/circle') ||
      (this.props.location.pathname === prevProps.location.pathname &&
        this.props.location.search !== prevProps.location.search)
    ) {
      this.props.sync()
    }
  }

  render(b) {
    const {
      circle,
      error,
      history,
      isCircleInEdition,
      loading,
      onGoBack,
    } = this.props
    return (
      <section className={b}>
        <Helmet>
          <title>
            Gibolt - {circle.circle_name ? circle.circle_name : 'Circle'}
          </title>
        </Helmet>
        {loading && <Loading />}
        {error && (
          <article className={b.e('group').m({ error: true })}>
            <h2>Error during circle fetch/update</h2>
            {typeof error === 'object' ? (
              <ul>
                {error.map(err => (
                  <li key={err.id}>
                    <span className={b.e('bullet')} />
                    {err.value}
                  </li>
                ))}
              </ul>
            ) : (
              <code>{error}</code>
            )}
          </article>
        )}
        <article className={b.e('circle')}>
          {circle.circle_name && (
            <div>
              <CircleDetails />
              {!isCircleInEdition && (
                <div>
                  <CircleMeetings circle={circle} />
                  <CircleMilestones circle={circle} />
                  <CircleRoles circle={circle} />
                  {circle.circle_children.length > 0 ? (
                    <CircleSubCircles circle={circle} />
                  ) : (
                    ''
                  )}
                  <br />
                  <button type="submit" onClick={() => onGoBack(history)}>
                    Back to circles
                  </button>
                </div>
              )}
            </div>
          )}
        </article>
      </section>
    )
  }
}

export default withRouter(
  connect(
    state => ({
      circle: state.circle.results,
      error: state.circle.error,
      loading: state.circle.loading,
      location: state.router.location,
      isCircleInEdition: state.circle.is_in_edition,
    }),
    dispatch => ({
      onGoBack: history => {
        history.push('/circles')
      },
      sync: () => {
        dispatch(setLoading('labels'))
        dispatch(fetchResults('labels'))
        dispatch(setLoading('circle'))
        dispatch(fetchCircle())
      },
    })
  )(Circle)
)
