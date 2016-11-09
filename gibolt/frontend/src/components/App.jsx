import React, { Component } from 'react'
import { block } from '../utils'
import Header from '../components/Header'
import Status from '../components/Status'
import Filters from '../components/Filters'
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
        <Header />
        <Status />
        <Filters />
        <Issues />
      </main>
    )
  }
}

export default App
