import React, { Component } from 'react'
import { block } from '../utils'
import Presets from './Presets'
import Status from './Status'
import Labels from './Labels'
import Issues from './Issues'
import './App.sass'

const b = block('App')
class App extends Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    this.props.dispatchFirstLoad()
  }

  render() {
    return (
      <main className={ b }>
        <Presets />
        <Status />
        <Labels />
        <Issues />
      </main>
    )
  }
}

export default App
