import './IssueCreationDetail.sass'

import { parse } from 'query-string'
import React from 'react'
import { Helmet } from 'react-helmet'
import { withRouter } from 'react-router-dom'

import { fetchResults, goBack, setLoading, setParams } from '../actions'
import {
  changeMilestoneSelect,
  changeRolesSelect,
  fetchRepositoryWithoutLabels,
  submitIssue,
  updateTitle,
} from '../actions/issueForm'
import { block, connect, sortRepos } from '../utils'
import Loading from './Loading'
import MarkdownEditor from './MarkdownEditor'

const b = block('IssueCreationDetail')

class IssueCreationDetail extends React.Component {
  componentWillMount() {
    const search = parse(this.props.location.search)
    this.props.sync(search)
  }

  componentDidUpdate() {
    if (
      this.props.issueForm.milestonesSelect.length > 0 &&
      this.props.params.grouper === 'milestone'
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
    const splitValue = this.props.params.group.split(' ⦔ ')[pos]
    const value =
      pos === 0
        ? splitValue
        : splitValue === 'No milestone'
          ? ''
          : this.props.issueForm.milestonesSelect.length > 0
            ? this.props.issueForm.milestonesSelect.filter(
                milestone => milestone.milestone_number === +splitValue
              )[0]
              ? this.props.issueForm.milestonesSelect.filter(
                  milestone => milestone.milestone_number === +splitValue
                )[0].milestone_number
              : ''
            : ''
    return value
  }

  render() {
    const {
      circles,
      error,
      history,
      issueForm,
      labels,
      loading,
      onCircleChange,
      onGoBack,
      onProjectChange,
      onTitleChange,
      onSubmit,
      params,
      repository,
      repositories,
    } = this.props
    let repos = []
    if (params.grouper === 'milestone' || params.grouper === 'project') {
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
                params.grouper === 'milestone' || params.grouper === 'project'
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
              disabled={params.grouper === 'milestone'}
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
            Description:
            <MarkdownEditor />
          </label>
          <br />
          <article className={b('action')}>
            <button
              type="submit"
              onClick={event => onSubmit(event, history)}
              disabled={issueForm.project === '' || issueForm.title === ''}
            >
              Create
            </button>
            <button type="submit" onClick={() => onGoBack(history)}>
              Cancel
            </button>
          </article>
        </form>
      </section>
    )
  }
}

export default withRouter(
  connect(
    state => ({
      circles: state.circles.results,
      error: state.issueForm.results.error,
      issueForm: state.issueForm.results,
      labels: state.labels.results.priority,
      loading: state.circle.loading,
      params: state.params,
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
      onGoBack: history => {
        dispatch(goBack(history))
      },
      onProjectChange: repoName => {
        dispatch(changeMilestoneSelect(repoName))
      },
      onSubmit: (event, history) => {
        event.preventDefault()
        dispatch(submitIssue(event, history))
      },
      sync: locationSearch => {
        dispatch(setParams(locationSearch))
        dispatch(setLoading('circles'))
        dispatch(fetchResults('circles'))
        if (
          locationSearch.grouper === 'milestone' ||
          locationSearch.grouper === 'project'
        ) {
          dispatch(changeMilestoneSelect(locationSearch.group.split(' ⦔ ')[0]))
          dispatch(setLoading('repository'))
          dispatch(
            fetchRepositoryWithoutLabels(locationSearch.group.split(' ⦔ ')[0])
          )
        } else {
          dispatch(setLoading('repositories'))
          dispatch(fetchResults('repositories'))
        }
      },
    })
  )(IssueCreationDetail)
)
