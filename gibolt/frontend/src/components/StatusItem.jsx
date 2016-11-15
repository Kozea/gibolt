import React, { Component } from 'react'
import { Link }  from 'redux-little-router'
import { block } from '../utils'
import './StatusItem.sass'


const b = block('StatusItem')
export default function StatusItem(props) {
  return (
    <li className={ b({active: props.active}) }>
      <Link className={ b('link') } href={{
          pathname: '/',
          query: {
            state: props.action
          }
        }}>{props.children}</Link>
    </li>
  )
}
