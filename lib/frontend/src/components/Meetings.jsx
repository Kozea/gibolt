import './Meetings.sass'

import React from 'react'
import { Helmet } from 'react-helmet'

import { block, connect } from '../utils'
import Loading from './Loading'

const b = block('Meetings')

function Meetings({ error, loading }) {
  return (
    <section className={b()}>
      <Helmet>
        <title>Gibolt - Meetings</title>
      </Helmet>
      {error && (
        <article className={b('group', { error: true })}>
          <h2>Error during issue fetch</h2>
          <code>{error}</code>
        </article>
      )}
      {loading && <Loading />}
      <article className={b('meetings')}>
        <h2>Meetings</h2>
      </article>
    </section>
  )
}
export default connect(state => ({
  loading: state.circles.loading,
  error: state.circles.errors,
}))(Meetings)
