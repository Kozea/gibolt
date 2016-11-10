import React, { Component } from 'react'
import { block } from '../utils'
import Label from './Label'
import './Labels.sass'

const b = block('Labels')
export default function Labels() {
  return (
    <aside className={ b }>
      <ul className={ b('set', {type: 'priority'}) }>
        <Label label="sprint" color="#009800" active={true} />
        <Label label="next" color="#882211" />
        <Label label="must" color="#dd1111" />
        <Label label="nice" color="#ff4500" />
        <Label label="later" color="#fbca04" />
      </ul>
      <ul className={ b('set', {type:'type'}) }>
        <Label label="feature" color="#207de5" />
        <Label label="bug" color="#9a62d3" />
        <Label label="document" color="#a1a1a1" />
        <Label label="commercial" color="#7aafb3" />
        <Label label="design" color="#add924" />
        <Label label="tool" color="#882244" />
        <Label label="debt" color="#0b0b0b" />
        <Label label="star" color="#ffffff" />
      </ul>
    </aside>
  )
}
