import './IssueCreationDetail.sass'

import React from 'react'
import { Helmet } from 'react-helmet'

import {
  changeMilestoneSelect,
  changeRolesSelect,
  goBack,
  submitIssue,
  updateTitle,
} from '../actions/issueForm'
import { block, connect, sortRepos } from '../utils'
import Loading from './Loading'

const b = block('IssueCreationDetail')

class IssueCreationDetail extends React.Component {
  componentDidMount() {
    if (this.props.issueForm.params.grouper !== '') {
      switch (this.props.issueForm.params.grouper) {
        case 'milestone':
        case 'project':
          this.updateProjectSelect()
          break
      }
    }
  }

  componentDidUpdate() {
    if (
      this.props.issueForm.milestonesSelect.length > 0 &&
      this.props.issueForm.params.grouper === 'milestone'
    ) {
      this.updateMilestonesSelect()
    }
  }

  updateProjectSelect() {
    const projectName = this.splitMilestoneGroup(0)
    this.props.onProjectChange(projectName)
  }

  updateMilestonesSelect() {
    document.getElementById('milestone').value = this.splitMilestoneGroup(1)
  }

  splitMilestoneGroup(pos) {
    const splitValue = this.props.issueForm.params.group.split(' ⦔ ')[pos]
    const value =
      pos === 0
        ? splitValue
        : splitValue === 'No milestone'
          ? ''
          : this.props.issueForm.milestonesSelect.filter(
              milestone => milestone.milestone_number === +splitValue
            )[0].milestone_number
    return value
  }

  render() {
    const {
      circles,
      error,
      issueForm,
      labels,
      loading,
      onCircleChange,
      onGoBack,
      onProjectChange,
      onTitleChange,
      onSubmit,
      repository,
      repositories,
    } = this.props
    let repos = []
    if (
      issueForm.params.grouper === 'milestone' ||
      issueForm.params.grouper === 'project'
    ) {
      repos = [repository]
    } else {
      repos = sortRepos(repositories)
    }
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
        <form onSubmit={event => event.preventDefault()}>
          <label>
            Project (mandatory):
            <select
              id="project"
              name="project"
              value={issueForm.project}
              onChange={event => onProjectChange(event.target.value)}
              disabled={
                issueForm.params.grouper === 'milestone' ||
                issueForm.params.grouper === 'project'
              }
            >
              <option value="" />
              {repos.map(repo => (
                <option key={repo.repo_id} value={repo.repo_name}>
                  {repo.repo_name}
                </option>
              ))}
            </select>
          </label>
          <br />
          <label>
            Milestone:{' '}
            <select
              id="milestone"
              name="milestone"
              disabled={issueForm.params.grouper === 'milestone'}
            >
              <option value="" />
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
              <option value="" />
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
              <option value="" />
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
            Title (mandatory):<br />
            <input
              id="title"
              name="title"
              onChange={event => onTitleChange(event)}
            />
          </label>
          <br />
          <label>
            Description: <textarea id="body" name="body" rows="7" />
          </label>
          <br />
          <article className={b('action')}>
            <button
              type="submit"
              onClick={event => onSubmit(event)}
              disabled={issueForm.project === '' || issueForm.title === ''}
            >
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
}

export default connect(
  state => ({
    circles: state.circles.results,
    error: state.issueForm.results.error,
    issueForm: state.issueForm.results,
    labels: state.labels.results.priority,
    loading: state.circle.loading,
    repository: state.repository.results.repository,
    repositories: state.repositories.results.repositories,
  }),
  dispatch => ({
    onTitleChange: event => {
      dispatch(updateTitle(event.target.value))
    },
    onCircleChange: circleId => {
      dispatch(changeRolesSelect(circleId))
    },
    onGoBack: () => {
      dispatch(goBack())
    },
    onProjectChange: repoName => {
      dispatch(changeMilestoneSelect(repoName))
    },
    onSubmit: event => {
      event.preventDefault()
      dispatch(submitIssue(event))
    },
  })
)(IssueCreationDetail)
