import React, { Component } from 'react'
import { connect } from 'react-redux'
import { push } from '../actions'
import { block, values, repositoryNameFromState } from '../utils'
import Loading from './Loading'
import './Repository.sass'


const b = block('Repository')
function Repository({ query, loading, error, labels, reponame }) {
  return (
    <section className={ b }>
      <h1>{ reponame }</h1>
      {labels.map((label) => (
            <span key={ label } className={ b('label') }>
              { label }
            </span>
      ))}
    </section>
  )
}
export default connect(state => ({
    query: state.router.query,
    labels: state.repository.results.labels,
    loading: state.repository.loading,
    error: state.repository.error,
    reponame: repositoryNameFromState(state).name
  }), dispatch => ({
    onDateChange: (date, type, query) => {
      dispatch(push({
        pathname: '/timeline',
        query: {
          ...query,
          [type]: date || undefined
        }
      }))
    }
  })
)(Repository)
