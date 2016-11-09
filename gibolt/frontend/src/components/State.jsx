import React, { Component } from 'react'
import { block } from '../utils'
import StatusItem from './StatusItem'
import './State.sass'


const b = block('State')
export default function State() {
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
