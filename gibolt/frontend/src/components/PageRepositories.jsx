import React, { Component } from 'react'
import { connect } from 'react-redux'
import { block } from '../utils'
import Presets from './Presets'
import Repositories from './Repositories'


const b = block('PageRepositories')
export default function PageRepositories() {
  let loading = false, error = null
  return (
    <main className={ b }>
      <Presets />
      <Repositories />
    </main>
  )
}
