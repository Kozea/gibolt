import './MeetingReport.sass'

import block from 'bemboo'
import { format } from 'date-fns'
import React from 'react'

import { updateMeetingAgenda } from '../../actions/meetings'
import { connect } from '../../utils'

const b = block('MeetingReport')

function ReportAgenda(props) {
  const { isEditionDisabled, issues, onAgendaChange, setTimer } = props
  return (
    <span>
      <h3>Agenda:</h3>
      {issues.length > 0 ? (
        <ul>
          {issues.map(issue => (
            <li key={issue.ticket_id} title={issue.body}>
              <span className={b.e(`bullet ${issue.state}`)} />
              <a
                href={issue.html_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                #{issue.ticket_number}
              </a>{' '}
              {issue.ticket_title},
              <span className={b.e('lighter')}>
                {issue.closed_at && (
                  <span>
                    closed:{' '}
                    {format(new Date(issue.closed_at), 'dd/MM/yyyy HH:mm')}
                    {', '}
                  </span>
                )}
                last update:{' '}
                {format(new Date(issue.updated_at), 'dd/MM/yyyy HH:mm')}
              </span>
              {issue.assignees.map(user => (
                <img
                  key={user.user_id}
                  className={b.e('avatar')}
                  src={user.avatar_url}
                  alt="avatar"
                  title={user.user_name}
                />
              ))}
              <br />
              <input
                className={`largeInput${isEditionDisabled ? '__disabled' : ''}`}
                disabled={isEditionDisabled}
                id="agenda"
                onChange={event => {
                  setTimer()
                  onAgendaChange(issue.ticket_id, event.target.value)
                }}
                value={issue.meeting_comment}
              />
            </li>
          ))}
        </ul>
      ) : (
        'No selected issues.'
      )}
    </span>
  )
}
export default connect(
  () => ({}),
  dispatch => ({
    onAgendaChange: (ticketId, value) =>
      dispatch(updateMeetingAgenda(ticketId, value)),
  })
)(ReportAgenda)
