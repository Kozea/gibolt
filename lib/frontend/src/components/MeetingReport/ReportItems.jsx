import './MeetingReport.sass'

import { format } from 'date-fns'
import React from 'react'

import {
  updateMeetingActions,
  updateMeetingIndicators,
} from '../../actions/meetings'
import { block, connect } from '../../utils'

const b = block('MeetingReport')

function ReportItems(props) {
  const {
    actions,
    currentMeeting,
    indicators,
    isEditionDisabled,
    meetings,
    onActionsChange,
    onIndicatorsChange,
    setTimer,
  } = props
  return (
    <span>
      <h3>Recurrent actions:</h3>
      {actions.length > 0 ? (
        <ul>
          {actions.map(action => (
            <li key={action.item_id}>
              <input
                checked={action.checked}
                disabled={isEditionDisabled}
                id="actions"
                name={action.content}
                onChange={event => {
                  setTimer()
                  onActionsChange(event.target)
                }}
                type="checkbox"
              />
              {action.content}
            </li>
          ))}
        </ul>
      ) : (
        'No actions defined.'
      )}
      <h3>Indicators:</h3>
      {indicators.length > 0 ? (
        <div className={b('itemTable')}>
          <table>
            <thead>
              <tr>
                <th />
                <th>
                  {meetings[1]
                    ? `#${meetings[1].report_id} - ${format(
                        new Date(meetings[1].created_at),
                        'DD/MM/YYYY'
                      )}`
                    : ''}
                </th>
                <th>
                  {meetings[0]
                    ? `#${meetings[0].report_id} - ${format(
                        new Date(meetings[0].created_at),
                        'DD/MM/YYYY'
                      )}`
                    : ''}
                </th>
                <th>
                  {currentMeeting.report_id
                    ? `#${currentMeeting.report_id} - ${format(
                        new Date(currentMeeting.created_at),
                        'DD/MM/YYYY'
                      )}`
                    : 'Today'}
                </th>
              </tr>
            </thead>
            <tbody>
              {indicators.map(indicator => (
                <tr key={indicator.item_id}>
                  <td className={b('itemContent')}>{indicator.content}</td>
                  <td>
                    {meetings[1] &&
                      meetings[1].indicators
                        .filter(ind => ind.item_id === indicator.item_id)
                        .map(ind => ind.value)}
                  </td>
                  <td>
                    {meetings[0] &&
                      meetings[0].indicators
                        .filter(ind => ind.item_id === indicator.item_id)
                        .map(ind => ind.value)}
                  </td>
                  <td>
                    <input
                      className={`smallInput${
                        isEditionDisabled ? '__disabled' : ''
                      }`}
                      disabled={isEditionDisabled}
                      id="indicateurs"
                      name={indicator.content}
                      onChange={event => {
                        setTimer()
                        onIndicatorsChange(event.target)
                      }}
                      type="text"
                      value={indicator.value}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        'No indicators defined.'
      )}
    </span>
  )
}
export default connect(
  () => ({}),
  dispatch => ({
    onActionsChange: target =>
      dispatch(updateMeetingActions(target.name, target.checked)),
    onIndicatorsChange: target =>
      dispatch(updateMeetingIndicators(target.name, target.value)),
  })
)(ReportItems)
