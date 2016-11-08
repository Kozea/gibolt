import React, { Component } from 'react'
import { pacomo } from '../utils'
import FilterItem from './FilterItem'
import './Filters.sass'


export default pacomo.transformer(
  function Filters() {
    return (
      <aside>
        <ul className="set priority">
          <FilterItem label="sprint" color="#009800" active={true} />
          <FilterItem label="next" color="#882211" />
          <FilterItem label="must" color="#dd1111" />
          <FilterItem label="nice" color="#ff4500" />
          <FilterItem label="later" color="#fbca04" />
        </ul>
        <ul className="set type">
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
)
