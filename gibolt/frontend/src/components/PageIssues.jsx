import React, { Component } from 'react'
import { block } from '../utils'
import Presets from './Presets'
import Status from './Status'
import Labels from './Labels'
import Issues from './Issues'


const b = block('PageIssues')
export default function PageIssues() {
  return (
    <main className={ b }>
      <Presets />
      <Status />
      <Labels />
      <Issues />
    </main>
  )
}
