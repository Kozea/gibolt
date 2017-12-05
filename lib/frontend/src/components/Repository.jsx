import './Repository.sass'

import React from 'react'
import { Helmet } from 'react-helmet'

import { createLabels, deleteLabels } from '../actions'
import { block, connect, repositoryNameFromState } from '../utils'
import Loading from './Loading'

const b = block('Repository')

function Repository({
  labels,
  loading,
  results,
  reponame,
  onCreateLabels,
  onDeleteLabels,
}) {
  const confLabels = labels.priority.concat(labels.ack, labels.qualifier)

  const missingLabels = confLabels.filter(
    confLabel =>
      results.labels
        .map(resultLabel => resultLabel.label_name)
        .indexOf(confLabel.text) === -1
  )
  const overlyLabels = results.labels.filter(
    resultLabel =>
      confLabels.map(label => label.text).indexOf(resultLabel.label_name) === -1
  )

  console.log('Labels')
  console.log(confLabels)
  console.log(missingLabels)
  console.log(results.labels)

  return (
    <section className={b()}>
      <Helmet>
        <title>Gibolt - Repository</title>
      </Helmet>
      <h1>{reponame}</h1>
      {loading && <Loading />}
      <article>
        <h2>Current labels</h2>
        <ul>
          {results.labels.map(label => (
            <li key={label.label_id} className={b('label')}>
              <span
                className={b('bullet')}
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
          {missingLabels.map(label => (
            <li key={label.text} className={b('label')}>
              <span
                className={b('bullet')}
                style={{ backgroundColor: `#${label}` }}
              />
              {label.text}
            </li>
          ))}
        </ul>
        {results.repository.permissions.push ? (
          <article className={b('action')}>
            <button type="submit" onClick={() => onCreateLabels()}>
              Add missing labels
            </button>
          </article>
        ) : (
          <p>
            You can’t change labels on this repository, ask an admin for write
            permission.
          </p>
        )}
      </article>
      <article>
        <h2>Unconfigured labels</h2>
        <ul>
          {overlyLabels.map(label => (
            <li key={label.label_id} className={b('label')}>
              <span
                className={b('bullet')}
                style={{ backgroundColor: `#${label}` }}
              />
              {label.label_name}
            </li>
          ))}
        </ul>
        {results.repository.permissions.push ? (
          <article className={b('action')}>
            <button type="submit" onClick={() => onDeleteLabels()}>
              Delete Unconfigured labels
            </button>
          </article>
        ) : (
          <p>
            You can’t change labels on this repository, ask an admin for write
            permission.
          </p>
        )}
      </article>
    </section>
  )
}
export default connect(
  state => ({
    labels: state.labels.results,
    results: state.repository.results,
    loading: state.repository.loading,
    error: state.repository.error,
    reponame: repositoryNameFromState(state).name,
  }),
  dispatch => ({
    onCreateLabels: () => {
      dispatch(createLabels())
    },
    onDeleteLabels: () => {
      dispatch(deleteLabels())
    },
  })
)(Repository)
