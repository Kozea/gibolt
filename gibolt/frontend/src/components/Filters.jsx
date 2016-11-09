import React, { Component } from 'react'
import { block } from '../utils'
import FilterItem from './FilterItem'
import './Filters.sass'

const b = block('Filters')
export default function Filters() {
  return (
    <aside className={ b }>
      <ul className={ b('set', {type: 'priority'}) }>
        <FilterItem label="sprint" color="#009800" active={true} />
        <FilterItem label="next" color="#882211" />
        <FilterItem label="must" color="#dd1111" />
        <FilterItem label="nice" color="#ff4500" />
        <FilterItem label="later" color="#fbca04" />
      </ul>
      <ul className={ b('set', {type:'type'}) }>
        <FilterItem label="feature" color="#207de5" />
        <FilterItem label="bug" color="#9a62d3" />
        <FilterItem label="document" color="#a1a1a1" />
        <FilterItem label="commercial" color="#7aafb3" />
        <FilterItem label="design" color="#add924" />
        <FilterItem label="tool" color="#882244" />
        <FilterItem label="debt" color="#0b0b0b" />
        <FilterItem label="star" color="#ffffff" />
      </ul>
    </aside>
  )
}
