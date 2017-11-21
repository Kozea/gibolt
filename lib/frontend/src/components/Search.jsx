import './Search.sass'

import React from 'react'

import { fetchResults, search } from '../actions'
import { block, connect } from '../utils'

const b = block('Search')

function Search({ search, onSearchChange }) {
  return (
    <div className={b()}>
      <input
        type="text"
        className={b('input')}
        value={search}
        onChange={e => onSearchChange(e.target.value)}
      />
    </div>
  )
}

export default connect(
  state => ({ search: state.search }),
  dispatch => ({
    onSearchChange: value => {
      dispatch(search(value))
      dispatch(fetchResults('issues'))
    },
  })
)(Search)
