import './MeetingReport.sass'

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
    indicators,
    isEditionDisabled,
    onActionsChange,
    onIndicatorsChange,
  } = props
  return (
    <span>
      <h3>Recurrent actions:</h3>
      {actions.length > 0 ? (
        <ul>
          {actions.map(action => (
            <li key={action.id}>
              <input
                checked={action.checked}
                disabled={isEditionDisabled}
                id="actions"
                name={action.content}
                onChange={event => onActionsChange(event.target)}
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
        <ul>
          {indicators.map(indicator => (
            <li key={indicator.id}>
              <span className={b('bullet')} />
              {indicator.content}
              :{' '}
              <input
                className={`smallInput${isEditionDisabled ? '__disabled' : ''}`}
                disabled={isEditionDisabled}
                id="indicateurs"
                name={indicator.content}
                onChange={event => onIndicatorsChange(event.target)}
                type="text"
                value={indicator.value}
              />
            </li>
          ))}
        </ul>
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
