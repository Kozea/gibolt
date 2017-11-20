import React, { Component } from 'react'
import { block } from '../utils'
import './Loading.sass'


const b = block('Loading')
export default function Loading(props) {
  return (
    <div className={ b }>
      <div className={ b('container') }>
        {[1, 2, 3, 4].map((i) =>
          <div key={i} className={ b('box', {'n': i}) }></div>
        )}
      </div>
    </div>
  )
}
