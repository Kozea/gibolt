import React, { Component } from 'react'
import moment from 'moment'
import Progress from './Progress'
import { block } from '../utils'
import './Milestone.sass'


const b = block('Milestone')
export default function Milestone(props) {
  return (
    <li className={ b({status: props.state})}>
      <span className={ b('day') }>
        { moment(props.due_on).date() }
      </span>
      <span className={ b('repo') }>
        { props.repo }
      </span>
      <a className={ b('link') } href={ props.html_url }>
        { props.title }
      </a>
      <Progress val={ props.closed_issues } total={ props.open_issues + props.closed_issues } />
    </li>
  )
}
