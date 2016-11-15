import React, { Component } from 'react'
import { connect } from 'react-redux'
import { block } from '../utils'
import Issue from './Issue'
import Loading from './Loading'
import { filterIssues, groupIssues, sortGroupIssues, sortIssues } from '../utils'
import './Issues.sass'


const b = block('Issues')
function Issues({ issues, issuesState, allIssues, loading, grouper, availableLabels, error }) {
  let issuesByGroup = sortGroupIssues(groupIssues(issues, grouper), grouper)
  let len = issues.length
  let closedLen = allIssues.filter((issue) => issue.state == 'closed').length
  let progressTitle = `${closedLen}/${allIssues.length} ${closedLen/allIssues.length}%`

  return (
    <section className={ b }>
      <h1 className={ b('head') }>
        { issues.length } {
          issuesState == 'all' ? '' : ` ${ issuesState }`} issues {
           issuesState == 'all' ? '' : `over ${ allIssues.length } `}
        grouped by { grouper } <input type="checkbox" />
        <progress value={ closedLen / allIssues.length } title={ progressTitle }>{ closedLen }/{ len }</progress>
      </h1>
      { loading && <Loading /> }
      { error && (
        <article className={ b('group', { error: true }) }>
          <h2>Error during issue fetch</h2>
          <code>{ error }</code>
        </article>
      )}
      { issuesByGroup.map(({ id, group, issues }) =>
        <article key={ id } className={ b('group') }>
          <h2>
            { group } <sup>({ issues.length })</sup> <input type="checkbox" />
          </h2>
          <ul>
            { sortIssues(issues, grouper).map((issue) =>
              <Issue
                key={ issue.id }
                id={ issue.number }
                state={ issue.state }
                title={ issue.title }
                users={ issue.assignees }
                avatars={ issue.avatars }
                project={ issue.project }
                labels={ issue.labels }
                url={ issue.html_url }
              />
            )}
          </ul>
        </article>
      )}
    </section>
  )
}


export default connect((state) => {
    return {
      issues: filterIssues(state.issues.list, state),
      allIssues: state.issues.list,
      loading: state.issues.loading,
      grouper: state.grouper,
      issuesState: state.issuesState,
      availableLabels: state.labels.available.priority.concat(
        state.labels.available.qualifier),
      error: state.issues.error
    }
  }
)(Issues)
