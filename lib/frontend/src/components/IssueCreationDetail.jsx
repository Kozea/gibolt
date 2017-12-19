import './IssueCreationDetail.sass'

import React from 'react'
import { Helmet } from 'react-helmet'

import {
  changeMilestoneSelect,
  changeRolesSelect,
  goBack,
  submitIssue,
} from '../actions/issueForm'
import { block, connect, sortRepos } from '../utils'
import Loading from './Loading'

const b = block('IssueCreationDetail')

function formPreventDefault(event) {
  event.preventDefault()
}

function IssueCreationDetail({
  circles,
  error,
  issueForm,
  labels,
  loading,
  onCircleChange,
  onGoBack,
  onProjectChange,
  onSubmit,
  repositories,
}) {
  const sortedRepos = sortRepos(repositories)
  return (
    <section className={b()}>
      <Helmet>
        <title>Gibolt - Create an issue</title>
      </Helmet>
      <h2>Create an issue</h2>
      {loading && <Loading />}
      {error && (
        <article className={b('date', { error: true })}>
          <h3>Error during issue creation</h3>
          <code>{error}</code>
          <br />
          <br />
        </article>
      )}
      <form onSubmit={event => formPreventDefault(event)}>
        <label>
          <select
            id="project"
            name="project"
            onChange={event => onProjectChange(event.target.value)}
          >
            {sortedRepos.map(repo => (
              <option key={repo.repo_id} value={repo.repo_name}>
                {repo.repo_name}
              </option>
            ))}
          </select>
        </label>
        <br />
        <label>
          Milestone:{' '}
          <select id="milestone" name="milestone">
            <option value="">{''}</option>
            {issueForm.milestonesSelect.map(milestone => (
              <option
                key={milestone.milestone_id}
                value={milestone.milestone_number}
              >
                {milestone.milestone_title}
              </option>
            ))}
          </select>
        </label>
        <br />
        <label>
          Circle:{' '}
          <select
            id="circle"
            name="circle"
            onChange={event => onCircleChange(event.target.value)}
          >
            {circles.map(circle => (
              <option key={circle.circle_id} value={circle.circle_id}>
                {circle.circle_name}
              </option>
            ))}
          </select>
        </label>
        <br />
        <label>
          Role assignment:
          <select id="roles" name="roles">
            <option value="">{''}</option>
            {issueForm.rolesSelect.map(role => (
              <option key={role.role_id} value={role.user_id}>
                {role.role_name}
              </option>
            ))}
          </select>
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
          Title*:<br />
          <input id="title" name="title" />
        </label>
        <br />
        <label>
          Description: <textarea id="body" name="body" rows="7" />
        </label>
        <br />
        <article className={b('action')}>
          <button type="submit" onClick={event => onSubmit(event)}>
            Create
          </button>
          <button type="submit" onClick={() => onGoBack()}>
            Cancel
          </button>
        </article>
      </form>
    </section>
  )
}
export default connect(
  state => ({
    circles: state.circles.results,
    error: state.issueForm.results.error,
    issueForm: state.issueForm.results,
    labels: state.labels.results.priority,
    loading: state.circle.loading,
    repositories: state.repositories.results.repositories,
  }),
  dispatch => ({
    onCircleChange: circleId => {
      dispatch(changeRolesSelect(circleId))
    },
    onGoBack: () => {
      dispatch(goBack())
    },
    onProjectChange: repoId => {
      dispatch(changeMilestoneSelect(repoId))
    },
    onSubmit: event => {
      event.preventDefault()
      dispatch(submitIssue(event))
    },
  })
)(IssueCreationDetail)
