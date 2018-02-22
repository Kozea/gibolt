import './MeetingsReportCreation.sass'

import React from 'react'

import { block } from '../../utils'

const b = block('MeetingsReportCreation')

export default function ReportItems(props) {
  const { actions, indicators } = props
  return (
    <span>
      <h3>Recurrent actions:</h3>
      {actions.length > 0 ? (
        <ul>
          {actions.map(action => (
            <li key={action.id}>
              <input
                checked={action.checked}
                id="actions"
                name={action.content}
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
                className="smallInput"
                id="indicateurs"
                name={indicator.content}
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
