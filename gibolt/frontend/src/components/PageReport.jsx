import React, { Component } from 'react'
import { connect } from 'react-redux'
import { block } from '../utils'
import Presets from './Presets'
import Report from './Report'


const b = block('PageReport')
export default function PageReport() {
  let loading = false, error = null
  return (
    <main className={ b }>
      <Presets />
      <Report />
    </main>
  )
}
