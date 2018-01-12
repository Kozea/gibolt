import './Milestone.sass'

import { format } from 'date-fns'
import React from 'react'

import { block } from '../utils'
import Progress from './Progress'

const b = block('Milestone')

export default function Milestone(props) {
  return (
    <li className={b({ status: props.state })}>
      <span className={b('day')}>
        {format(new Date(props.due_on), 'DD/MM/YYYY')}
      </span>
      <span className={b('repo')}>{props.repo}</span>
      <a className={b('link')} href={props.html_url}>
        {props.title}
      </a>
      <Progress
        val={props.closed_issues}
        total={props.open_issues + props.closed_issues}
      />
      <span className={b('unlink')} title="Add to a circle">
        <i className="fa fa-plus-circle addCircle" aria-hidden="true" />
      </span>
    </li>
  )
}
