import './Labels.sass'

import React from 'react'

import { fetchResults, setLoading } from '../../actions'
import { block, connect } from '../../utils'

const b = block('Labels-admin')

class Labels extends React.Component {
  componentDidMount() {
    this.props.sync()
  }

  render() {
    return (
      <div className={b()}>
        <h3>Labels</h3>
      </div>
    )
  }
}

export default connect(
  state => ({
    labels: state.labels.results,
    error: state.labels.error,
    loading: state.labels.loading,
  }),
  dispatch => ({
    sync: () => {
      dispatch(setLoading('labels'))
      dispatch(fetchResults('labels'))
    },
  })
)(Labels)
