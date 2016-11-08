import React, { Component } from 'react'
import { pacomo } from '../utils'
import State from './State'
import Grouper from './Grouper'
import './Status.sass'

@pacomo.decorator
export default class Status extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <aside>
        <State />
        <Grouper />
      </aside>
    )
  }
}
