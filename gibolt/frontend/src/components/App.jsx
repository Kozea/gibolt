import React, { Component } from 'react'
import { block } from '../utils'
import './App.sass'

const b = block('App')
export default class App extends Component {
  constructor(props) {
    super(props)
    this.props = props
  }
  //
  // componentDidMount() {
  //   this.props.dispatchFirstLoad()
  // }

  render() {
    return (
      <div className={ b }>
        { this.props.children }
      </div>
    )
  }
}
