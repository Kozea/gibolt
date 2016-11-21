import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  block, grouperFromState, issuesStateFromState, filterIssuesOnState, filterIssuesOnLabels,
  groupIssues, sortGroupIssues, sortIssues } from '../utils'
import Issue from './Issue'
import Loading from './Loading'
import Progress from './Progress'
import { toggleIssue, setIssuesSelectness, toggleExpanded, postChangeSelectedIssuesPriority, setLoading } from '../actions'
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
function Issues({ labelFilteredIssues, issues, issuesState, loading, grouper, availableLabels, error, onToggleSelected, onToggleGrouper, onToggleExpanded, onChangePriority}) {
  let issuesByGroup = sortGroupIssues(groupIssues(issues, grouper), grouper)
  let closedLen = labelFilteredIssues.filter((issue) => issue.state == 'closed').length

  return (
    <section className={ b }>
      <h1 className={ b('head') }>
        { issues.length } {
          issuesState == 'all' ? '' : ` ${ issuesState }`} issues {
           issuesState == 'all' ? '' : `over ${ labelFilteredIssues.length } in total `}
        { grouper != 'nogroup' && `grouped by ${ grouper }`} <input type="checkbox"
          checked={ checkboxState(issues) == 'checked'}
          ref={elem => elem && (elem.indeterminate = checkboxState(issues) == 'indeterminate')}
          onChange={ () => onToggleGrouper(issues.map((issue) => issue.id), (checkboxState(issues) != 'checked')) }/>
        <Progress val={ closedLen } total={ labelFilteredIssues.length } />
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
                project={ issue.repository_url.split('/').splice(-1)[0] }
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
      <article className={ b('action') }>
        <button type="submit" onClick={ () => onChangePriority('increment') }>Increment priority</button>
        <button type="submit" onClick={ () => onChangePriority('removeTop') }>Remove top priority</button>
      </article>
    </section>
  )
}


export default connect((state) => {
    let labelFilteredIssues = filterIssuesOnLabels(state.issues.results.issues, state)
    return {
      labelFilteredIssues,
      issues: filterIssuesOnState(labelFilteredIssues, state),
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
        dispatch(setLoading('issues'))
        dispatch(postChangeSelectedIssuesPriority(change))
      }
    }
  }
)(Issues)
