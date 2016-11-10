import React, { Component } from 'react'
import { block } from '../utils'
import Presets from '../components/Presets'
import Status from '../components/Status'
import Labels from '../components/Labels'
import Issues from '../components/Issues'
import './App.sass'

const b = block('App')
class App extends Component {
  constructor(props) {
    super(props)
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
