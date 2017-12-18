import './IssueCreationDetail.sass'

import React from 'react'
import { Helmet } from 'react-helmet'

import { block, connect } from '../utils'

const b = block('IssueCreationDetail')

function onGoBack() {
  history.go(-1)
}

function IssueCreationDetail({ circles, labels }) {
  return (
    <section className={b()}>
      <Helmet>
        <title>Gibolt - Create an issue</title>
      </Helmet>
      <h2>Create an issue</h2>
      <form>
        <label>
          Project: <input id="project" name="project" />
        </label>
        <br />
        <label>
          Milestone: <input id="milestone" name="milestone" />
        </label>
        <br />
        <label>
          Circle:{' '}
          <select id="circle" name="circle">
            {circles.map(circle => (
              <option key={circle.circle_id} value={circle.circle_id}>
                {circle.circle_name}
              </option>
            ))}
          </select>
        </label>
        <br />
        <label>
          Roles: <select id="roles" name="roles" />
        </label>
        <br />
        <label>
          Priority:{' '}
          <select id="priority" name="priority">
            {labels.map(label => (
              <option key={label.text} value={label.text}>
                {label.text}
              </option>
            ))}
          </select>
        </label>
        <br />
        <label>
          Title: <input id="title" name="title" />
        </label>
        <br />
        <label>
          Description:{' '}
          <textarea id="description" name="description" rows="10" cols="40" />
        </label>
        <br />
        <article className={b('action')}>
          <button type="submit">Create</button>
          <button type="submit" onClick={() => onGoBack()}>
            Cancel
          </button>
        </article>
      </form>
    </section>
  )
}
export default connect(state => ({
  circles: state.circles.results,
  error: state.circle.error,
  labels: state.labels.results.priority,
  loading: state.circle.loading,
  users: state.users.results,
}))(IssueCreationDetail)
