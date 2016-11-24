import React, { Component } from 'react'
import { Link }  from 'redux-little-router'
import { block } from '../utils'
import './Progress.sass'



const b = block('Progress')
export default function Progress({ val, total }) {
  total = total || 1
  let disp = Math.round(100 * val / total).toFixed() + '%'
  return (
    <span className={ b }>
      <progress
        className={ b('bar') }
        value={ val / total }
        title={ `${ val } / ${ total } - ${disp}` }>
        { disp }
      </progress>
      <span className={ b('status') }>{ disp }</span>
    </span>
  )
}
