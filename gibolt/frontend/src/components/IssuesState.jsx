import React, { Component } from 'react'
import { block } from '../utils'
import StatusItem from './StatusItem'
import './IssuesState.sass'


const b = block('IssuesState')
export default function IssuesState() {
  return (
    <ul className={ b }>
      <StatusItem action="open" active={true}>
        Open
      </StatusItem>
      <StatusItem action="closed">
        Closed
      </StatusItem>
      <StatusItem action="all">
        All
      </StatusItem>
    </ul>
  )
}
