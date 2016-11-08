import React, { Component } from 'react'
import { pacomo } from '../utils'
import StatusItem from './StatusItem'
import './State.sass'


export default pacomo.transformer(
  function State() {
    return (
      <ul>
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
)
