import React, { Component } from 'react'
import { connect } from 'react-redux'
import { block, strToList, labelsFromState } from '../utils'
import Label from './Label'
import User from './User'
import { selectLabel, selectOnlyLabel } from '../actions/'
import './Labels.sass'


const b = block('Labels')
function Labels({ labels, query, queryLabels, modifiers }) {

  const makeQuery = (label, type) => {
    if (modifiers.shift || modifiers.ctrl) {
      if (queryLabels[type].find(x => x == label)) {
        return { ...query, [type]: queryLabels[type].filter(x => x != label) }
      }
      return { ...query, [type]: [...queryLabels[type], label] }
    }

    if (type == 'priority' &&
        queryLabels[type].find(x => x == label) &&
        queryLabels[type].filter(x => x != label).length == 1) {
      return { ...query, [type]: ['']}
    }

    return { ...query, [type]: [label] }
  }

  return (
    <aside className={ b }>
      { ['priority', 'qualifier'].map((type) =>
        <ul key={ type } className={ b('set', { type }) }>
          { labels[type].map((label) =>
            <Label
              key={ label.text }
              label={ label.text }
              color={ label.color }
              action={{ pathname: '/', query: makeQuery(label.text, type) }}
              active={ queryLabels[type].find((x) => (x == label.text)) !== undefined } />
          )}
        </ul>
      )}
      <User />
    </aside>
  )
}

export default connect(state => {
  return {
    query: state.router.query,
    queryLabels: labelsFromState(state),
    labels: state.labels,
    modifiers: state.modifiers
  }
})(Labels)
