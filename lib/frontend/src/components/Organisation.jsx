import React from 'react'
import { Helmet } from 'react-helmet'

import { connect } from '../utils'
import Loading from './Loading'

function Organisation(loading, error, circle) {
  return (
    <div>
      <Helmet>
        <title>Gibolt - Organisation</title>
      </Helmet>
      {loading && <Loading />}
      {error && (
        <article>
          <h2>Error during circles fetch</h2>
          <code>{error}</code>
        </article>
      )}
      Organisation
      {(console.log('circles'), console.log(circle))}
    </div>
  )
}
export default connect(state => ({
  circle: state.organisaton.results.circle,
  loading: state.organisaton.loading,
  error: state.organisaton.error,
}))(Organisation)
