import React, { Component } from 'react'
import { connect } from 'react-redux'
import { block, labelsFromState } from '../utils'
import Label from './Label'
import { selectLabel, selectOnlyLabel, fetchIssues } from '../actions/'
import './Labels.sass'

const b = block('Labels')
function Labels({ labels, query, queryLabels }) {
  return (
    <aside className={ b }>
    { ['priority', 'qualifier'].map((type) =>
      <ul key={ type } className={ b('set', { type }) }>
        { labels[type].map((label) =>
          <Label
            key={ label.text }
            label={ label.text }
            color={ label.color }
            action={{ pathname: '/', query: { ...query, [type]: [label.text] } }}
            active={ queryLabels[type].find((x) => (x == label.text)) !== undefined } />
        )}
      </ul>
    )}
    </aside>
  )
}

export default connect((state) => {
  return {
    query: state.router.query,
    queryLabels: labelsFromState(state),
    labels: state.labels
  }
})(Labels)
