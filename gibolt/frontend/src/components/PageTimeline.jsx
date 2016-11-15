import React, { Component } from 'react'
import { connect } from 'react-redux'
import { block } from '../utils'
import Presets from './Presets'
import Timeline from './Timeline'


const b = block('PageTimeline')
export default function PageTimeline() {
  let loading = false, error = null
  return (
    <main className={ b }>
      <Presets />
      <Timeline />
    </main>
  )
}
