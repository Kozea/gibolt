import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link }  from 'redux-little-router'
import { block } from '../utils'
import SelectUser from './SelectUser'
import './User.sass'


const b = block('User')
export default function User({ type, query, users, onChangeUser }) {
  return (
    <div className={ b }>
      <h3>Assignee</h3>
      <SelectUser type='assignee' />
      <h3>Involves</h3>
      <SelectUser type='involves' />
    </div>
  )
}
