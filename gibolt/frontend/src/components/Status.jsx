import React, { Component } from 'react'
import { block } from '../utils'
import State from './State'
import Grouper from './Grouper'
import './Status.sass'

const b = block('Status')
export default class Status extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <aside className={ b }>
        <State />
        <Grouper />
      </aside>
    )
  }
}
