import React, { Component } from 'react'
import { connect } from 'react-redux'
import { block } from '../utils'
import Issue from './Issue'
import Loading from './Loading'
import './Issues.sass'

const filterIssues = (issues, state) => {
  return issues.filter((issue) => {
    return (
      state.issuesState == 'all' || state.issuesState == issue.state
    )
  })
}

const groupIssues = (issues, grouper) => {
  if (grouper == 'nogroup') {
    return [{
      group: 'Overall',
      issues
    }]
  }
  if (grouper == 'assignee') {
    let grouped = issues.reduce((groups, issue) => {
      if (groups[issue['assignee']] == undefined) {
        groups[issues[grouper]] = []
      }
      groups[issues[grouper]].push(issue)
      return groups
    }, {})

    return Object.keys(grouped).map((key) => ({
      group:key,
      issues: grouped[key]
    }))
  }
  let grouped = issues.reduce((groups, issue) => {
    if (groups[issue[grouper]] == undefined) {
      groups[issue[grouper]] = []
    }
    groups[issue[grouper]].push(issue)
    return groups
  }, {})
  return Object.keys(grouped).map((key) => ({
    group: key,
    issues: grouped[key]
  }))
}

const b = block('Issues')
function Issues({ issues, loading, grouper, availableLabels }) {
  let issuesByGroup = groupIssues(issues, grouper)
  let len = issues.length
  let closedLen = issues.filter((issue) => issue.state == 'closed').length
  let progressTitle = `${closedLen}/${len} ${closedLen/len}%`

  return (
    <section className={ b }>
      <h1 className={ b('head') }>
        { issues.length } issues grouped by { grouper }
        <input type="checkbox" />
        <progress value={ closedLen / len } title={ progressTitle }>{ closedLen }/{ len }</progress>
      </h1>
      { loading && <Loading /> }
      { issuesByGroup.map(({ group, issues }) =>
        <article key={ group } className={ b('group') }>
          <h2>
            { group == 'null' ? 'Non défini' : group }
            <input type="checkbox" />
          </h2>
          <ul>
            { issues.map((issue) =>
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
      loading: state.issues.loading,
      grouper: state.grouper,
      availableLabels: state.labels.available.priority.concat(
        state.labels.available.qualifier)
    }
  }
)(Issues)
