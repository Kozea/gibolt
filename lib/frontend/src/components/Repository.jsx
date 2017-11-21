import './Repository.sass'

import React from 'react'

import { createLabels, deleteLabels } from '../actions'
import { block, connect, repositoryNameFromState } from '../utils'
import Loading from './Loading'

const b = block('Repository')

function Repository({
  loading,
  results,
  reponame,
  onCreateLabels,
  onDeleteLabels,
}) {
  return (
    <section className={b()}>
      <h1>{reponame}</h1>
      {loading && <Loading />}
      <article>
        <h2>Current labels</h2>
        <ul>
          {results.labels.map(label => (
            <li key={label.id} className={b('label')}>
              <span
                className={b('bullet')}
                style={{ backgroundColor: `#${label.color}` }}
              />
              {label.name}
            </li>
          ))}
        </ul>
      </article>
      <article>
        <h2>Missing labels</h2>
        <ul>
          {results.missingLabels.map(label => (
            <li key={label[0]} className={b('label')}>
              <span
                className={b('bullet')}
                style={{ backgroundColor: `#${label[1]}` }}
              />
              {label[0]}
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
          {results.overlyLabels.map(label => (
            <li key={label[0]} className={b('label')}>
              <span
                className={b('bullet')}
                style={{ backgroundColor: `#${label[1]}` }}
              />
              {label[0]}
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
