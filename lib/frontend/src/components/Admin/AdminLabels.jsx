import './AdminLabels.sass'

import React from 'react'

import { setLoading } from '../../actions'
import { fetchLabels } from '../../actions/labels'
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
    adminLabels: state.adminLabels.results,
    error: state.adminLabels.error,
    loading: state.adminLabels.loading,
  }),
  dispatch => ({
    sync: () => {
      dispatch(setLoading('adminLabels'))
      dispatch(fetchLabels())
    },
  })
)(Labels)
