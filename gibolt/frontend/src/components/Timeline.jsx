import React, { Component } from 'react'
import { connect } from 'react-redux'
import { block } from '../utils'
import Loading from './Loading'


const b = block('Timeline')
export default function Timeline() {
  let loading = false, error = null
  return (
    <section className={ b }>
      <h1 className={ b('head') }>
        Timeline from october 2016 to september 2017
      </h1>
      { loading && <Loading /> }
      { error && (
        <article className={ b('group', { error: true }) }>
          <h2>Error during issue fetch</h2>
          <code>{ error }</code>
        </article>
      )}
      <article>
        Timeline
      </article>
    </section>
  )
}
