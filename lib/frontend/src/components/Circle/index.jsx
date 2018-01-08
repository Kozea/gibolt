import './Circle.sass'

import React from 'react'
import { Helmet } from 'react-helmet'
import { withRouter } from 'react-router-dom'

import { goBack } from '../../actions'
import { block, connect } from '../../utils'
import CircleDetails from './CircleDetails'
import CircleMeetings from './CircleMeetings'
import CircleRoles from './CircleRoles'
import CircleSubCircles from './CircleSubCircles'
import Loading from './../Loading'

const b = block('Circle')

function Circle({
  circle,
  error,
  history,
  isCircleInEdition,
  loading,
  onGoBack,
}) {
  return (
    <section className={b()}>
      <Helmet>
        <title>Gibolt - Circle</title>
      </Helmet>
      {error && (
        <article className={b('group', { error: true })}>
          <h2>Error during circle fetch</h2>
          {typeof error === 'object' ? (
            <ul>
              {error.map(err => (
                <li key={err.id}>
                  <span className={b('bullet')} />
                  {err.value}
                </li>
              ))}
            </ul>
          ) : (
            <code>{error}</code>
          )}
        </article>
      )}
      <article className={b('circle')}>
        {circle.circle_name && (
          <div>
            <h1>{circle.circle_name}</h1>
            {circle.parent_circle_name && (
              <span>
                {circle.parent_circle_name
                  ? `(sous-cercle de "${circle.parent_circle_name}")`
                  : ''}
              </span>
            )}
            {loading && <Loading />}
            <CircleDetails />
            {!isCircleInEdition && (
              <div>
                <CircleMeetings />
                <CircleRoles />
                {circle.children_circles.length > 0 ? <CircleSubCircles /> : ''}
                <br />
                <button type="submit" onClick={() => onGoBack(history)}>
                  Back
                </button>
              </div>
            )}
          </div>
        )}
      </article>
    </section>
  )
}

export default withRouter(
  connect(
    state => ({
      circle: state.circle.results,
      error: state.circle.error,
      loading: state.circle.loading,
      isCircleInEdition: state.circle.is_in_edition,
    }),
    dispatch => ({
      onGoBack: history => {
        dispatch(goBack(history))
      },
    })
  )(Circle)
)
