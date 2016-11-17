import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  block, grouperFromState, issuesStateFromState, filterIssuesOnState, filterIssuesOnLabels,
  groupIssues, sortGroupIssues, sortIssues } from '../utils'
import Issue from './Issue'
import Loading from './Loading'
import Progress from './Progress'
import { toggleIssue, setIssuesSelectness, toggleExpanded, postChangeSelectedIssuesPriority } from '../actions'
import './Issues.sass'

function checkboxState(issues) {
  var selectedIssues = issues.filter((issue) => issue.selected).length
  if (selectedIssues == 0) {
    return 'unchecked'
  }
  if (selectedIssues == issues.length) {
    return 'checked'
  }
  return 'indeterminate'
}


const b = block('Issues')
function Issues({ issues, issuesState, allIssues, loading, grouper, availableLabels, error, onToggleSelected, onToggleGrouper, onToggleExpanded, onChangePriority}) {
  let issuesByGroup = sortGroupIssues(groupIssues(issues, grouper), grouper)
  let closedLen = allIssues.filter((issue) => issue.state == 'closed').length

  return (
    <section className={ b }>
      <h1 className={ b('head') }>
        { issues.length } {
          issuesState == 'all' ? '' : ` ${ issuesState }`} issues {
           issuesState == 'all' ? '' : `over ${ allIssues.length } in total `}
        { grouper != 'nogroup' && `grouped by ${ grouper }`} <input type="checkbox"
          checked={ checkboxState(issues) == 'checked'}
          ref={elem => elem && (elem.indeterminate = checkboxState(issues) == 'indeterminate')}
          onChange={ () => onToggleGrouper(issues.map((issue) => issue.id), (checkboxState(issues) != 'checked')) }/>
        <Progress val={ closedLen } total={ allIssues.length } />
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
            { group } <sup>
              ({ issues.length })
            </sup> <input type="checkbox"
             checked={ checkboxState(issues) == 'checked'}
             ref={ elem => elem && (elem.indeterminate = checkboxState(issues) == 'indeterminate' ) }
             onChange={ () => onToggleGrouper(issues.map((issue) => issue.id), (checkboxState(issues) != 'checked')) }/>
           <Progress val={ issues.filter(i => i.state == 'closed').length } total={ issues.length } />
          </h2>
          <ul>
            { sortIssues(issues, grouper).map((issue) =>
              <Issue
                key={ issue.id }
                id={ issue.number }
                state={ issue.state }
                title={ issue.title }
                body={ issue.body }
                users={ issue.assignees }
                avatars={ issue.avatars }
                project={ issue.project }
                labels={ issue.labels }
                selected={ issue.selected }
                url={ issue.html_url }
                expanded={ issue.expanded }
                onBoxChange={() => onToggleSelected(issue.id)}
                onClick={() => onToggleExpanded(issue.id)}
              />
            )}
          </ul>
        </article>
      )}
    <button type="submit" onClick={ () => onChangePriority('increment') }>Increment priority</button>
    <button type="submit" onClick={ () => onChangePriority('removeTop') }>Remove top priority</button>
    </section>
  )
}


export default connect((state) => {
    return {
      issues: filterIssuesOnLabels(filterIssuesOnState(state.issues.list, state), state),
      allIssues: state.issues.list,
      loading: state.issues.loading,
      grouper: grouperFromState(state),
      issuesState: issuesStateFromState(state),
      availableLabels: state.labels.priority.concat(
        state.labels.qualifier),
      error: state.issues.error
    }
  }, (dispatch) => {
    return {
      onToggleSelected: (issueId) => {
        dispatch(toggleIssue(issueId))
      },
      onToggleExpanded: (issueId) => {
        dispatch(toggleExpanded(issueId))
      },
      onToggleGrouper: (issuesId, isSelected) => {
        dispatch(setIssuesSelectness(issuesId, isSelected))
      },
      onChangePriority: (change) => {
        dispatch(postChangeSelectedIssuesPriority(change))
      }
    }
  }
)(Issues)
