import React from 'react'

import { updateATicket } from '../../actions/issues'
import { block, connect } from '../../utils'
import MarkdownEditor from './../Utils/MarkdownEditor'

const b = block('IssueDetail')

class IssueForm extends React.Component {
  getComponent(type, issue, roles, milestones) {
    switch (type) {
      case 'title':
        return (
          <input
            className="inputTitle"
            defaultValue={issue.ticket_title}
            name="data"
          />
        )
      case 'assignees':
        return (
          <select
            defaultValue={
              issue.assignees[0] ? issue.assignees[0].user_name : ''
            }
            name="data"
          >
            <option value="" />
            {roles.map(role =>
              role.role_focuses.map(
                focus =>
                  focus.role_focus_users.length > 0 && (
                    <option
                      key={focus.role_focus_id}
                      value={focus.role_focus_users[0].user_name}
                    >
                      {role.role_name}
                      {focus.focus_name !== '' && ` - ${focus.focus_name}`}
                      {` (${focus.role_focus_users[0].user_name})`}
                    </option>
                  )
              )
            )}
          </select>
        )
      case 'milestone':
        return (
          <select
            className={b('milestoneSelect')}
            defaultValue={issue.milestone_number ? issue.milestone_number : ''}
            id="milestone"
            name="data"
          >
            <option value="" />
            {milestones.map(milestone => (
              <option
                key={milestone.milestone_id}
                value={milestone.milestone_number}
              >
                {milestone.milestone_title}
              </option>
            ))}
          </select>
        )
      case 'body':
        return <MarkdownEditor />
    }
  }

  render() {
    const {
      id,
      issue,
      milestones,
      onUpdateIssue,
      roles,
      type,
      updateEditionStatusToNull,
    } = this.props
    return (
      <form
        id={id}
        onSubmit={e => {
          e.preventDefault()
          onUpdateIssue(
            type,
            type === 'body' ? e.target.body.value : e.target.data.value,
            issue
          )
          updateEditionStatusToNull()
        }}
      >
        {this.getComponent(type, issue, roles, milestones)}
        <button type="submit">Update</button>
        <button onClick={updateEditionStatusToNull} type="button">
          Cancel
        </button>
      </form>
    )
  }
}
export default connect(
  () => ({}),
  dispatch => ({
    onUpdateIssue: (type, targetValue, issue) => {
      let values
      switch (type) {
        case 'assignees':
          values = { [type]: [targetValue] }
          break
        case 'milestones':
          values = { [type]: targetValue === '' ? null : targetValue }
          break
        default:
          values = { [type]: targetValue }
      }
      dispatch(updateATicket(Object.assign({}, issue), values))
    },
  })
)(IssueForm)
