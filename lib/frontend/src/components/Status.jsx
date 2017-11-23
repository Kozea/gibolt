import './Status.sass'

import React from 'react'

import { block } from '../utils'
import Grouper from './Grouper'
import IssuesState from './IssuesState'
import Search from './Search'

const b = block('Status')

export default function Status() {
  return (
    <aside className={b()}>
      <IssuesState />
      <Grouper />
      <Search />
    </aside>
  )
}
