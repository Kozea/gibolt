import './AdminRepository.sass'

import block from 'bemboo'
import React from 'react'
import { Helmet } from 'react-helmet'

import {
  createLabels,
  deleteLabels,
  fetchRepository,
  fetchResults,
  setLoading,
} from '../../actions'
import { connect, repositoryNameFromState } from '../../utils'
import Loading from './../Loading'

@block
class Repository extends React.Component {
  componentDidMount() {
    this.props.sync()
  }

  render(b) {
    const {
      history,
      loading,
      results,
      reponame,
      onCreateLabels,
      onDeleteLabels,
      onGoBack,
    } = this.props
    return (
      <section className={b}>
        <Helmet>
          <title>Gibolt - Repository</title>
        </Helmet>
        <h1>
          {results.repository.html_url ? (
            <a
              href={results.repository.html_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {reponame}
            </a>
          ) : (
            reponame
          )}
        </h1>
        {results.errors && (
          <div>
            <ul>
              {results.errors.map(error => (
                <li key={error.id}>
                  <span className={b.e('bullet')} />
                  {error.value}
                </li>
              ))}
            </ul>
          </div>
        )}
        {loading && <Loading />}
        <article>
          <h2>Current labels</h2>
          <ul>
            {results.labels.map(label => (
              <li key={label.label_id} className={b.e('label')}>
                <span
                  className={b.e('bullet')}
                  style={{ backgroundColor: `#${label.color}` }}
                />
                {label.label_name}
              </li>
            ))}
          </ul>
        </article>
        <article>
          <h2>Missing labels</h2>
          <ul>
            {results.missingLabels.map(label => (
              <li key={label.text} className={b.e('label')}>
                <span
                  className={b.e('bullet')}
                  style={{ backgroundColor: `#${label}` }}
                />
                {label.text}
              </li>
            ))}
          </ul>
          {results.missingLabels.length > 0 ? (
            results.repository.permissions.push ? (
              <article className={b.e('action')}>
                <button type="submit" onClick={() => onCreateLabels(results)}>
                  Add missing labels
                </button>
              </article>
            ) : (
              <p>
                You can’t change labels on this repository, ask an admin for
                write permission.
              </p>
            )
          ) : (
            <p>None</p>
          )}
        </article>
        <article>
          <h2>Unconfigured labels</h2>
          <ul>
            {results.overlyLabels.map(label => (
              <li key={label.label_id} className={b.e('label')}>
                <span
                  className={b.e('bullet')}
                  style={{ backgroundColor: `#${label}` }}
                />
                {label.label_name}
              </li>
            ))}
          </ul>
          {results.overlyLabels.length > 0 ? (
            results.repository.permissions.push ? (
              <article className={b.e('action')}>
                <button type="submit" onClick={() => onDeleteLabels(results)}>
                  Delete Unconfigured labels
                </button>
              </article>
            ) : (
              <p>
                You can’t change labels on this repository, ask an admin for
                write permission.
              </p>
            )
          ) : (
            <p>None</p>
          )}
        </article>
        <button type="submit" onClick={() => onGoBack(history)}>
          Back to repositories
        </button>
      </section>
    )
  }
}
export default connect(
  state => ({
    results: state.repository.results,
    loading: state.repository.loading,
    reponame: repositoryNameFromState(state).name,
  }),
  dispatch => ({
    onCreateLabels: results => {
      dispatch(createLabels(results))
    },
    onDeleteLabels: results => {
      dispatch(deleteLabels(results))
    },
    onGoBack: history => {
      history.push('/admin/repositories')
    },
    sync: () => {
      dispatch(setLoading('labels'))
      dispatch(fetchResults('labels'))
      dispatch(setLoading('repository'))
      dispatch(fetchRepository())
    },
  })
)(Repository)
