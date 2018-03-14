import './MilestoneDisplay.sass'

import { format } from 'date-fns'
import React from 'react'

import Progress from './../Progress'
import { block } from '../../utils'

const b = block('MilestoneDisplay')

export default function MilestoneDisplay(props) {
  const { milestone } = props
  return (
    <span>
      <a className={b('unlink')} href={milestone.html_url} target="_blank">
        <span className={b(`bullet ${milestone.state}`)} />
        {milestone.repo}
        {' - '}
        <span className={b('lab')}>{milestone.title}</span>
      </a>
      {' -'}
      <Progress
        val={milestone.closed_issues}
        total={milestone.open_issues + milestone.closed_issues}
      />
      <span className={b('due-date')}>
        {' ('}
        {milestone.due_on
          ? `due on: ${format(new Date(milestone.due_on), 'DD/MM/YYYY')}`
          : 'no due date'}
        {')'}
      </span>
    </span>
  )
}
