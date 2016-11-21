import React, { Component } from 'react'
import { connect } from 'react-redux'
import { block, values } from '../utils'
import Loading from './Loading'
import './Repositories.sass'


const b = block('Repositories')
function Repositories({ loading, error, repositories }) {

  return (
    <section className={ b }>
      <h1 className={ b('head') }>
        Repositories
      </h1>
      { loading && <Loading /> }
      { error && (
        <article className={ b('date', { error: true }) }>
          <h2>Error during report fetch</h2>
          <code>{ error }</code>
        </article>
      )}
      <article className={ b('repositories') }>
        <ul>
          { repositories.map(repository =>
            <li key={ repository } className={ b('item') }>
              { repository }
            </li>
          )}
        </ul>
      </article>
    </section>
  )
}
export default connect(state => ({
    repositories: state.repositories.results.repositories,
    loading: state.repositories.loading,
    error: state.repositories.error
  })
)(Repositories)
