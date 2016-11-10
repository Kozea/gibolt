import React, { Component } from 'react'
import { connect } from 'react-redux'
import { block } from '../utils'
import Label from './Label'
import { selectLabel, selectOnlyLabel } from '../actions/'
import './Labels.sass'

const b = block('Labels')
function Labels({ labels, onLabelItemClick }) {
  return (
    <aside className={ b }>
    {['priority', 'qualifier'].map((type) =>
      <ul key={ type } className={ b('set', { type }) }>
        {labels.available[type].map((label) =>
          <Label
            key={ label.text }
            label={ label.text }
            color={ label.color }
            active={ labels.selected[type].find((x) => (x == label.text)) !== undefined }
            onClick={ (e) => { onLabelItemClick(type, label.text, e.shiftKey) } }/>
        )}
      </ul>
    )}
    </aside>
  )
}

export default connect((state) => {
    return {labels: state.labels}
  }, (dispatch) => {
    return {
      onLabelItemClick: (label_type, label, multiple) => {
        dispatch((multiple ? selectLabel : selectOnlyLabel)(
          label_type, label))
      }
    }
  }
)(Labels)
