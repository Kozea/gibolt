import './MeetingReport.sass'

import { format } from 'date-fns'
import React from 'react'

import MilestoneDisplay from './../Utils/MilestoneDisplay'
import { setModal, updateIssueParams } from '../../actions/issues'
import { sortProjects, updateMeetingProjects } from '../../actions/meetings'
import { block, connect } from '../../utils'

const b = block('MeetingReport')

function ReportProjects(props) {
  const {
    circleId,
    isEditionDisabled,
    onMilestoneClick,
    onModalCreation,
    onProjectsChange,
    projects,
    setTimer,
  } = props
  const sortedProjects = sortProjects(projects)
  return (
    <span>
      <h3>Projects:</h3>
      {sortedProjects.length > 0 ? (
        <ul>
          {sortedProjects.map(milestone => (
            <li key={milestone.id} title={milestone.description}>
              <MilestoneDisplay
                circleId={circleId}
                displayProgress
                milestone={milestone}
                target="meeting"
              />
              {milestone.state === 'open' && (
                <span
                  className={b('newTicket')}
                  onClick={() =>
                    onModalCreation(
                      'milestone',
                      `${milestone.repo} ⦔ ${milestone.number}`
                    )
                  }
                  title="Open an issue"
                >
                  <i
                    className="fa fa-plus-circle createIssue"
                    aria-hidden="true"
                  />
                </span>
              )}
              {milestone.issues.filter(issue => !issue.pull_request).length >
                0 && (
                <span>
                  <span
                    className={b('lighter')}
                    onClick={() => onMilestoneClick(milestone.id)}
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
                className={`largeInput${isEditionDisabled ? '__disabled' : ''}`}
                disabled={isEditionDisabled}
                id="milestones"
                onChange={event => {
                  setTimer()
                  onProjectsChange(milestone.id, event.target.value)
                }}
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
