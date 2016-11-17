import React, { Component } from 'react'
import { Link }  from 'redux-little-router'
import { block } from '../utils'
import './Progress.sass'


const b = block('Progress')
export default function Progress({ val, total }) {
  total = total || 1
  return (
    <span className={ b }>
      <progress
        className={ b('bar') }
        value={ val / total }
        title={ `${ val }/${ total } ${ val / total }%` }>
        { (100 * val / total).toFixed() }%
      </progress>
      <span className={ b('status') }>{ (100 * val / total).toFixed() }%</span>
    </span>
  )
}
