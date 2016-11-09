import React, { Component } from 'react'
import { block } from '../utils'
import StatusItem from './StatusItem'


const b = block('Grouper')
export default function Grouper() {
  return (
    <ul className={ b }>
      <StatusItem action="nogroup">
        Don’t Group
      </StatusItem>
      <StatusItem action="assignee" active={true}>
        Assignee
      </StatusItem>
      <StatusItem action="milestone">
        Milestone
      </StatusItem>
      <StatusItem action="state">
        State
      </StatusItem>
      <StatusItem action="Project">
        Project
      </StatusItem>
    </ul>
  )
}
