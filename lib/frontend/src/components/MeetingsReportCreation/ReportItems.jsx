import './MeetingsReportCreation.sass'

import React from 'react'

import { block } from '../../utils'

const b = block('MeetingsReportCreation')

export default function ReportItems(props) {
  const { selectedCircle, items } = props
  return (
    <span>
      {selectedCircle.roles &&
        selectedCircle.roles.length > 0 && (
          <span>
            <h3>Recurrent actions:</h3>
            <ul>
              {items &&
                items.map(
                  roleItems =>
                    roleItems.items &&
                    roleItems.items
                      .filter(item => item.item_type === 'checklist')
                      .map(item => (
                        <li key={item.item_id}>
                          <input
                            type="checkbox"
                            name={`${roleItems.role_name} - ${item.content}`}
                            id="actions"
                          />
                          {roleItems.role_name} - {item.content}
                        </li>
                      ))
                )}
            </ul>
            <h3>Indicators:</h3>
            <ul>
              {items &&
                items.map(
                  roleItems =>
                    roleItems.items &&
                    roleItems.items
                      .filter(item => item.item_type === 'indicator')
                      .map(item => (
                        <li key={item.item_id}>
                          <span className={b('bullet')} />
                          {roleItems.role_name} - {item.content}
                          :{' '}
                          <input
                            type="text"
                            name={`${roleItems.role_name} - ${item.content}`}
                            id="indicateurs"
                            className="smallInput"
                          />
                        </li>
                      ))
                )}
            </ul>
          </span>
        )}
    </span>
  )
}
