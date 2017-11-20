import React, { Component } from 'react'
import { Link }  from 'redux-little-router'
import { block } from '../utils'
import './StatusItem.sass'


const b = block('StatusItem')
export default function StatusItem({ active, action, type, query, children }) {
  return (
    <li className={ b({ active: active }) }>
      <Link className={ b('link') } href={{
          pathname: '/',
          query: {
            ...query,
            [type]: action
          }
        }}>{ children }</Link>
    </li>
  )
}
