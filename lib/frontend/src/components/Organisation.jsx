import React from 'react'
import { Helmet } from 'react-helmet'

import { connect } from '../utils'
import Loading from './Loading'

function Organisation(
  loading,
  error
  // circles
) {
  return (
    <div>
      <Helmet>
        <title>Gibolt - Organisation</title>
      </Helmet>
      {loading && <Loading />}
      {/* {error && (
        <article>
          <h2>Error during circles fetch</h2>
          <code>{error}</code>
        </article>
      )} */}
      Organisation
      {/* {(console.log('circles'), console.log(circles))} */}
    </div>
  )
}
export default connect(state => ({
  // circles: state.organisation.results.circles,
  loading: state.organisation.loading,
  error: state.organisation.error,
}))(Organisation)
