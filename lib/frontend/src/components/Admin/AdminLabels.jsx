import './AdminLabels.sass'

import React from 'react'

import { setLoading } from '../../actions'
import { fetchLabels, updateSelectedLabelType } from '../../actions/labels'
import { block, connect } from '../../utils'
import Loading from './../Loading'

const b = block('AdminLabels')

class Labels extends React.Component {
  componentDidMount() {
    this.props.sync()
  }

  render() {
    const {
      adminLabels,
      error,
      loading,
      onTypeChange,
      selectedType,
    } = this.props
    return (
      <section className={b()}>
        <article className={b('adminLabels')}>
          <h3>Labels</h3>
          {error && (
            <article className={b('group', { error: true })}>
              <h2>Error during fetch</h2>
              <code>{error}</code>
            </article>
          )}
          {loading && <Loading />}
          <form>
            <label>
              Label types:
              <select
                id="labelTypes"
                name="labelTypes"
                onChange={event => onTypeChange(event.target.value)}
                value={selectedType}
              >
                <option value="" />
                {adminLabels.label_types.map(labelTypes => (
                  <option
                    key={labelTypes.label_type_id}
                    value={labelTypes.label_type_id}
                  >
                    {labelTypes.label_type_name}
                  </option>
                ))}
              </select>
            </label>
            <br />
            <label>Labels:</label>
            <ul>
              {adminLabels.labels
                .filter(label => label.label_type_id === selectedType)
                .map(label => (
                  <li
                    className={b('item')}
                    key={label.label_id}
                    style={{
                      color: label.label_color,
                    }}
                  >
                    <span className={b('text')}>
                      {label.label_name}
                      {label.priorities[0] &&
                        ` (priority: ${label.priorities[0].value})`}
                    </span>
                  </li>
                ))}
            </ul>
          </form>
        </article>
      </section>
    )
  }
}

export default connect(
  state => ({
    adminLabels: state.adminLabels.results,
    error: state.adminLabels.error,
    loading: state.adminLabels.loading,
    selectedType: state.adminLabels.selectedType,
  }),
  dispatch => ({
    onTypeChange: labelTypeId => {
      dispatch(updateSelectedLabelType(labelTypeId))
    },
    sync: () => {
      dispatch(setLoading('adminLabels'))
      dispatch(fetchLabels())
    },
  })
)(Labels)
