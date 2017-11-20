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
    const nLabel = `-${label}`
    if (modifiers.shift || modifiers.ctrl) {
      if (queryLabels[type].find(x => x == label)) {
        return { ...query, [type]: [...queryLabels[type].filter(x => x != label), nLabel] }
      } else if (queryLabels[type].find(x => x == nLabel)) {
        return { ...query, [type]: queryLabels[type].filter(x => x != nLabel) }
      }
      return { ...query, [type]: [...queryLabels[type], label] }
    }

    if (queryLabels[type].find(x => x == label)) {
      return { ...query, [type]: [...queryLabels[type].filter(x => x != label), nLabel] }
    }

    if (queryLabels[type].find(x => x == nLabel) &&
        queryLabels[type].filter(x => x != nLabel).length == 0) {
      return { ...query, [type]: [''] }
    }

    return { ...query, [type]: [label] }
  }

  return (
    <aside className={ b }>
      { ['priority', 'ack', 'qualifier'].map((type) =>
        <ul key={ type } className={ b('set', { type }) }>
          { labels[type].map((label) =>
            <Label
              key={ label.text }
              label={ label.text }
              color={ label.color }
              action={{ pathname: '/', query: makeQuery(label.text, type) }}
              active={{ active: queryLabels[type].find(x => x == label.text) != undefined,
                negative: queryLabels[type].find(x => x == `-${label.text}`) != undefined }} />
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
