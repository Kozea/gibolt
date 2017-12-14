import './Circle.sass'

import React from 'react'
import { Helmet } from 'react-helmet'

import { block, circleNameFromState, connect } from '../utils'
import Loading from './Loading'

const b = block('Circle')

function Circle({ circle, circlename, error, loading }) {
  return (
    <section className={b()}>
      <Helmet>
        <title>Gibolt - Circle</title>
      </Helmet>
      <h1>{circlename}</h1>
      {error && (
        <article className={b('group', { error: true })}>
          <h2>Error during issue fetch</h2>
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
      {loading && <Loading />}
      <article>
        <h3>{"Raison d'être"}</h3>
        <p>{circle.circle_purpose}</p>
        <h3>{'Domaines'}</h3>
        <p>{circle.circle_domain}</p>
        <h3>{'Redevabilités'}</h3>
        <p>{circle.circle_accountabilities}</p>
      </article>
      <article>
        <h3>Rôles</h3>
      </article>
    </section>
  )
}
export default connect(state => ({
  circle: state.circle.results,
  loading: state.circle.loading,
  error: state.circle.error,
  circlename: circleNameFromState(state).name,
}))(Circle)
