import React from 'react'
import Octicon from 'react-component-octicons'

export default function IssueStatusIcon(props) {
  const { issue } = props
  return (
    <span>
      {issue.pull_request === null ? (
        issue.state === 'closed' ? (
          <Octicon
            className="githubIcons"
            name="issue-closed"
            style={{ color: 'red' }}
          />
        ) : (
          <Octicon
            className="githubIcons"
            name="issue-opened"
            style={{ color: 'green' }}
          />
        )
      ) : issue.state === 'closed' ? (
        <Octicon
          className="githubIcons"
          name="git-merge"
          style={{ color: '#6f42c1' }}
        />
      ) : (
        <Octicon
          className="githubIcons"
          name="git-pull-request"
          style={{ color: 'green' }}
        />
      )}
    </span>
  )
}
