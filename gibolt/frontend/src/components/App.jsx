import React, { Component } from 'react'
import { pacomo } from '../utils'

import Header from '../components/Header'
import Status from '../components/Status'
import Filters from '../components/Filters'
import Issues from '../components/Issues'
import './App.sass'

@pacomo.decorator
class App extends Component {

  constructor(props) {
    super(props)
  }

  render() {
    return (
      <main>
        <Header />
        <Status />
        <Filters />
        <Issues />
      </main>
    )
  }
}

export default App
