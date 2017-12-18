import './IssueCreationDetail.sass'

import React from 'react'
import { Helmet } from 'react-helmet'

import { block, connect } from '../utils'

const b = block('IssueCreationDetail')

function onGoBack() {
  history.go(-1)
}

function IssueCreationDetail() {
  return (
    <section className={b()}>
      <Helmet>
        <title>Gibolt - Create a ticket</title>
      </Helmet>
      <h2>Create a ticket</h2>

      <article className={b('action')}>
        <button type="submit">Create</button>
        <button type="submit" onClick={() => onGoBack()}>
          Cancel
        </button>
      </article>
    </section>
  )
}
export default connect(state => ({
  error: state.circle.error,
  labels: state.labels.results,
  loading: state.circle.loading,
  users: state.users.results,
}))(IssueCreationDetail)
