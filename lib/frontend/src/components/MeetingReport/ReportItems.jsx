import './MeetingReport.sass'

import block from 'bemboo'
import { format } from 'date-fns'
import React from 'react'
import { Sparklines, SparklinesLine } from 'react-sparklines'

import {
  updateMeetingActions,
  updateMeetingIndicators,
} from '../../actions/meetings'
import { connect } from '../../utils'

const b = block('MeetingReport')

function getNextValue(sparklinesValues, startPosition) {
  let missingValuesCount = 1
  let nextValue = null
  for (let i = startPosition; i < sparklinesValues.length; i++) {
    if (sparklinesValues[i] === null && sparklinesValues[i - 1] === null) {
      missingValuesCount++
    } else if (i === sparklinesValues.length - 1 && sparklinesValues === null) {
      return null
    } else {
      nextValue = sparklinesValues[i]
      return { nextValue, missingValuesCount }
    }
  }
}

function interpolateMissingValues(sparklinesValues) {
  let nextValueAndMissingValuesCount = null
  for (let i = 1; i < sparklinesValues.length - 1; i++) {
    if (sparklinesValues[i] === null && sparklinesValues[i - 1] !== null) {
      nextValueAndMissingValuesCount = getNextValue(sparklinesValues, i + 1)
      if (nextValueAndMissingValuesCount) {
        const previousValue = sparklinesValues[i - 1]
        const { nextValue, missingValuesCount } = nextValueAndMissingValuesCount
        sparklinesValues[i] =
          previousValue - (previousValue - nextValue) / (missingValuesCount + 1)
      }
    }
  }
  return sparklinesValues
}

function getDataForSparkLines(indicator, meetings) {
  const sparklinesValues = []
  let lastValue = null
  for (let i = 8; i >= 0; i--) {
    if (meetings[i] && meetings[i].indicators) {
      const value = meetings[i].indicators
        .filter(ind => ind.item_id === indicator.item_id)
        .map(ind => ind.value)
      sparklinesValues.push(value[0] ? value[0] : null)
      if (i === 0) {
        // eslint-disable-next-line prefer-destructuring
        lastValue = value[0] ? value[0] : null
      }
    } else {
      sparklinesValues.push(null)
    }
  }
  sparklinesValues.push(
    isNaN(indicator.value) || indicator.value === '' || indicator.value === null
      ? lastValue
      : +indicator.value
  )
  return interpolateMissingValues(sparklinesValues)
}

function sortItems(items) {
  return items.sort((a, c) => {
    if (a.content.toLowerCase() < c.content.toLowerCase()) {
      return -1
    }
    if (a.content.toLowerCase() > c.content.toLowerCase()) {
      return 1
    }
    return 0
  })
}

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
  sortItems(actions)
  sortItems(indicators)

  return (
    <span>
      <h3>Recurrent actions:</h3>
      {actions.length > 0 ? (
        <ul>
          {actions.map(action => (
            <li key={action.item_id}>
              <label>
                <input
                  defaultChecked={action.checked}
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
              </label>
            </li>
          ))}
        </ul>
      ) : (
        'No actions defined.'
      )}
      <h3>Indicators:</h3>
      {indicators.length > 0 ? (
        <div className={b.e('itemTable')}>
          <table>
            <thead>
              <tr>
                <th />
                <th>
                  {meetings[1] ? (
                    <span>
                      <a
                        href={`/meeting?report_id=${meetings[1].report_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {`#${meetings[1].report_id}`}
                      </a>
                      <br />
                      {`${format(
                        new Date(meetings[1].created_at),
                        'dd/MM/yyyy'
                      )}`}
                    </span>
                  ) : (
                    'No meeting'
                  )}
                </th>
                <th>
                  {meetings[0] ? (
                    <span>
                      <a
                        href={`/meeting?report_id=${meetings[0].report_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {`#${meetings[0].report_id}`}
                      </a>
                      <br />
                      {`${format(
                        new Date(meetings[0].created_at),
                        'dd/MM/yyyy'
                      )}`}
                    </span>
                  ) : (
                    'No meeting'
                  )}
                </th>
                <th>
                  {currentMeeting.report_id ? (
                    <>
                      {`#${currentMeeting.report_id}`}
                      <br />
                      {`${format(
                        new Date(currentMeeting.created_at),
                        'dd/MM/yyyy'
                      )}`}
                    </>
                  ) : (
                    <>
                      <br />
                      {`${format(new Date(), 'dd/MM/yyyy')}`}
                    </>
                  )}
                </th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              {indicators.map(indicator => (
                <tr key={indicator.item_id}>
                  <td className={b.e('itemContent')}>{indicator.content}</td>
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
                      type="number"
                      value={
                        indicator.value === null || isNaN(indicator.value)
                          ? ''
                          : indicator.value
                      }
                    />
                  </td>
                  <td>
                    <Sparklines
                      data={getDataForSparkLines(indicator, meetings)}
                      svgHeight={25}
                    >
                      <SparklinesLine
                        style={{ stroke: '#01080d', fill: 'none' }}
                      />
                    </Sparklines>
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
