import './Status.sass'

import block from 'bemboo'
import React from 'react'

import Grouper from './Grouper'
import IssuesState from './IssuesState'
import Search from './Search'

const b = block('Status')

export default function Status() {
  return (
    <aside className={b}>
      <IssuesState />
      <Grouper />
      <Search />
    </aside>
  )
}
