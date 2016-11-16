import React, { Component } from 'react'
import { connect } from 'react-redux'
import { block, strToList, labelsFromState } from '../utils'
import Label from './Label'
import User from './User'
import { selectLabel, selectOnlyLabel, fetchIssues } from '../actions/'
import './Labels.sass'

const makeQuery = (label, query, type, queryTypeLabels) => {
  if (queryTypeLabels.find(x => x == label)) {
    let removedLabels = queryTypeLabels.filter(x => x != label)
    if (type == 'priority' && removedLabels.length == 0) {
      removedLabels = ['']
    }
    return { ...query, [type]:  removedLabels}
  }
  return { ...query, [type]: [label] }
}


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
              action={{ pathname: '/', query: makeQuery(label.text, query, type, queryLabels[type]) }}
              active={ queryLabels[type].find((x) => (x == label.text)) !== undefined } />
          )}
        </ul>
      )}
      <User />
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
