import './Repositories.sass'

import { stringify } from 'query-string'
import React from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'

import { fetchResults, setLoading } from '../actions'
import { block, connect } from '../utils'
import Loading from './Loading'

const b = block('Repositories')

class Repositories extends React.Component {
  componentWillMount() {
    this.props.sync()
  }

  render() {
    const { loading, error, repositories } = this.props
    return (
      <section className={b()}>
        <Helmet>
          <title>Gibolt - Repositories</title>
        </Helmet>
        <h1 className={b('head')}>Repositories</h1>
        {loading && <Loading />}
        {error && (
          <article className={b('date', { error: true })}>
            <h2>Error during report fetch</h2>
            <code>{error}</code>
          </article>
        )}
        <article className={b('repositories')}>
          <ul>
            {repositories.map(repository => (
              <li key={repository.repo_id} className={b('item')}>
                <Link
                  className={b('link')}
                  to={{
                    pathname: '/repository',
                    search: stringify({ name: repository.repo_name }),
                  }}
                >
                  {repository.repo_name}
                </Link>
              </li>
            ))}
          </ul>
        </article>
      </section>
    )
  }
}
export default connect(
  state => ({
    repositories: state.repositories.results.repositories,
    loading: state.repositories.loading,
    error: state.repositories.error,
  }),
  dispatch => ({
    sync: () => {
      dispatch(setLoading('repositories'))
      dispatch(fetchResults('repositories'))
    },
  })
)(Repositories)
