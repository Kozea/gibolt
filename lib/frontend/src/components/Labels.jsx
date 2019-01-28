import './Labels.sass'

import block from 'bemboo'
import React from 'react'

import { fetchResults, setLoading } from '../actions'
import { connect, labelsFromState } from '../utils'
import { parse, stringify } from '../utils/querystring'
import Label from './Label'
import User from './User'

@block
class Labels extends React.Component {
  componentDidMount() {
    const { loadLabels } = this.props
    loadLabels()
  }

  render(b) {
    const { labels, location, queryLabels, modifiers } = this.props
    const query = parse(location.search)
    const makeQuery = (label, type) => {
      const nLabel = `-${label}`
      if (modifiers.shift || modifiers.ctrl) {
        if (queryLabels[type].find(x => x === label)) {
          return {
            ...query,
            [type]: [...queryLabels[type].filter(x => x !== label), nLabel],
          }
        } else if (queryLabels[type].find(x => x === nLabel)) {
          return {
            ...query,
            [type]: queryLabels[type].filter(x => x !== nLabel),
          }
        }
        return { ...query, [type]: [...queryLabels[type], label] }
      }
      if (queryLabels[type].find(x => x === label)) {
        return {
          ...query,
          [type]: [...queryLabels[type].filter(x => x !== label), nLabel],
        }
      }

      if (
        queryLabels[type].find(x => x === nLabel) &&
        queryLabels[type].filter(x => x !== nLabel).length === 0
      ) {
        return { ...query, [type]: [''] }
      }

      return { ...query, [type]: [label] }
    }

    return (
      <aside className={b}>
        {['circle', 'priority', 'ack', 'qualifier'].map(type => (
          <ul key={type} className={b.e('set').m({ type })}>
            {labels[type].map(label => (
              <Label
                key={label.text}
                label={label.text}
                color={label.color}
                action={{
                  pathname: '/',
                  search: stringify(makeQuery(label.text, type)),
                }}
                active={{
                  active:
                    queryLabels[type].find(x => x === label.text) !== void 0,
                  negative:
                    queryLabels[type].find(x => x === `-${label.text}`) !==
                    void 0,
                }}
              />
            ))}
          </ul>
        ))}
        <User />
      </aside>
    )
  }
}

export default connect(
  state => ({
    queryLabels: labelsFromState(state),
    labels: state.labels.results,
    modifiers: state.modifiers,
  }),
  dispatch => ({
    loadLabels: () => {
      dispatch(setLoading('labels'))
      dispatch(fetchResults('labels'))
    },
  })
)(Labels)
