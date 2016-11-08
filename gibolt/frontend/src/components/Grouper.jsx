import React, { Component } from 'react'
import { pacomo } from '../utils'
import StatusItem from './StatusItem'


export default pacomo.transformer(
  function Grouper() {
    return (
      <ul>
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
)
