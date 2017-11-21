import './User.sass'

import React from 'react'

import { block } from '../utils'
import SelectUser from './SelectUser'

const b = block('User')

export default function User() {
  return (
    <div className={b()}>
      <h3>Assignee</h3>
      <SelectUser type="assignee" />
      <h3>Involves</h3>
      <SelectUser type="involves" />
    </div>
  )
}
