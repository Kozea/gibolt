import './MeetingsReportCreation.sass'

import React from 'react'

export default function ReportItems(props) {
  const { actions, indicators } = props
  return (
    <span>
      <h3>Recurrent actions:</h3>
      {actions.length > 0 ? (
        <ul>
          {actions.map(action => (
            <li key={action.id}>
              <input type="checkbox" name={action.content} id="actions" />
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
              <input type="checkbox" name={indicator.content} id="indicators" />
              {indicator.content}
            </li>
          ))}
        </ul>
      ) : (
        'No indicators defined.'
      )}
    </span>
  )
}
