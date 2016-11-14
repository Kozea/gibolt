import React, { Component }  from 'react'
import { block } from '../utils'
import './Search.sass'


const b = block('Search')
export default function Search(props) {
  return (
    <div className={ b }>
      <input type="text" value="" className={ b('input') } />
    </div>
  )
}
