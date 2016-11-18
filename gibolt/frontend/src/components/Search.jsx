import React, { Component }  from 'react'
import { connect } from 'react-redux'
import { block } from '../utils'
import { search, fetchResults } from '../actions'
import './Search.sass'


const b = block('Search')
function Search({ search, onSearchChange }) {
  return (
    <div className={ b }>
      <input type="text" className={ b('input') }
        value={ search }
        onChange={ (e) => onSearchChange(e.target.value) } />
    </div>
  )
}

export default connect((state) => {
  return {search: state.search}
}, (dispatch) => {
  return {
    onSearchChange: (value) => {
      dispatch(search(value))
      dispatch(fetchResults('issues'))
    }
  }
})(Search)
