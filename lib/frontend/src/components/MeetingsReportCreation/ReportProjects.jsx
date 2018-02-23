import './MeetingsReportCreation.sass'

import { format } from 'date-fns'
import React from 'react'

import Progress from './../Progress'
import { setModal, updateIssueParams } from '../../actions/issues'
import { updateMeetingProjects } from '../../actions/meetings'
import { block, connect } from '../../utils'

const b = block('MeetingsReportCreation')

function ReportProjects(props) {
  const {
    onMilestoneClick,
    onModalCreation,
    onProjectsChange,
    projects,
  } = props
  return (
    <span>
      <h3>Projects:</h3>
      {projects.length > 0 ? (
        <ul>
          {projects.map(milestone => (
            <li key={milestone.milestone_number} title={milestone.description}>
              <a
                className={b('unlink')}
                href={milestone.html_url}
                target="_blank"
              >
                <span className={b(`bullet ${milestone.state}`)} />
                {milestone.repo_name}
                {' - '}
                <span className={b('lab')}>{milestone.milestone_title}</span>
              </a>
              {' -'}
              <Progress
                val={milestone.closed_issues}
                total={milestone.open_issues + milestone.closed_issues}
              />
              <span className={b('due-date')}>
                {' ('}
                {milestone.due_on
                  ? `due on: ${format(
                      new Date(milestone.due_on),
                      'DD/MM/YYYY'
                    )}`
                  : 'no due date'}
                {')'}
              </span>
              {milestone.state === 'open' && (
                <span
                  className={b('newTicket')}
                  onClick={() =>
                    onModalCreation(
                      'milestone',
                      `${milestone.repo_name} ⦔ ${milestone.milestone_number}`
                    )
                  }
                >
                  <i
                    className="fa fa-plus-circle addCircle"
                    aria-hidden="true"
                  />
                </span>
              )}
              {milestone.issues.filter(issue => !issue.pull_request).length >
                0 && (
                  <span>
                    <span
                      className={b('lighter')}
                      onClick={() => onMilestoneClick(milestone.milestone_id)}
                    >
                      show/hide closed issues since last report
                    </span>
                    {milestone.is_expanded && (
                      <span>
                        <br />
                        <ul className={b('tickets')}>
                          {milestone.issues
                            .filter(issue => !issue.pull_request)
                            .map(issue => (
                              <li key={issue.ticket_id} title={issue.body}>
                                <span className={b('bullet')} />
                                <a href={issue.html_url} target="_blank">
                                  #{issue.ticket_number}
                                </a>{' '}
                                {issue.ticket_title},
                                <span className={b('lighter')}>
                                  closed:{' '}
                                  {format(
                                    new Date(issue.closed_at),
                                    'DD/MM/YYYY HH:mm'
                                  )}
                                  , last update:{' '}
                                  {format(
                                    new Date(issue.updated_at),
                                    'DD/MM/YYYY HH:mm'
                                  )}
                                </span>
                                {issue.assignees.map(user => (
                                  <img
                                    key={user.user_id}
                                    className={b('avatar')}
                                    src={user.avatar_url}
                                    alt="avatar"
                                    title={user.user_name}
                                  />
                                ))}
                              </li>
                            ))}
                        </ul>
                      </span>
                    )}
                  </span>
                )}
              <br />
              <input
                className="largeInput"
                id="milestones"
                onChange={event =>
                  onProjectsChange(milestone.milestone_id, event.target.value)
                }
                value={milestone.comment}
              />
            </li>
          ))}
        </ul>
      ) : (
        'No associated milestones.'
      )}
    </span>
  )
}
export default connect(
  () => ({}),
  dispatch => ({
    onModalCreation: (grouper, group) => {
      dispatch(updateIssueParams({ grouper, group }))
      dispatch(setModal(true, true, null))
    },
    onProjectsChange: (milestoneId, value) =>
      dispatch(updateMeetingProjects(milestoneId, value)),
  })
)(ReportProjects)
