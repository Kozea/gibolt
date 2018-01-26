import './AdminLabels.sass'

import React from 'react'

import { setLoading } from '../../actions'
import {
  addLabelAndPriority,
  deleteLabel,
  fetchLabels,
  updateSelectedLabelType,
} from '../../actions/labels'
import { block, connect } from '../../utils'
import Loading from './../Loading'

const b = block('AdminLabels')

class Labels extends React.Component {
  componentDidMount() {
    this.props.sync()
  }
  componentWillReceiveProps(nextProps) {
    if (
      this.props.adminLabels.label_types.length === 0 &&
      nextProps.adminLabels.label_types.length > 0
    ) {
      this.props.onTypeChange(
        nextProps.adminLabels.label_types[0].label_type_id
      )
    }
  }

  getPriorityLabelId(labelTypes) {
    const priorityLabel = labelTypes.filter(
      label => label.label_type_name === 'priority'
    )
    if (priorityLabel.length > 0) {
      return priorityLabel[0].label_type_id
    }
    return null
  }

  render() {
    const {
      adminLabels,
      error,
      loading,
      onDeleteLabel,
      onSubmit,
      onTypeChange,
      selectedLabelTypeId,
    } = this.props
    adminLabels.label_types.sort(function(a, c) {
      return a.label_type_name > c.label_type_name
        ? 1
        : c.label_type_name > a.label_type_name ? -1 : 0
    })
    const priorityLabelId = this.getPriorityLabelId(adminLabels.label_types)
    return (
      <section className={b()}>
        <article className={b('adminLabels')}>
          <h3>Labels</h3>
          {error && (
            <article className={b('group', { error: true })}>
              <code>ERROR: {error}</code>
            </article>
          )}
          {loading && <Loading />}
          <label>
            Label types:
            <select
              id="labelTypes"
              name="labelTypes"
              onChange={event => onTypeChange(event.target.value)}
              value={selectedLabelTypeId}
            >
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
          <label>Labels</label>
          <ul>
            {adminLabels.labels
              .filter(label => label.label_type_id === selectedLabelTypeId)
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
                    <i className="fa fa-edit btn" aria-hidden="true" />
                    <span
                      onClick={() => onDeleteLabel(label.label_id)}
                      title="Delete label"
                    >
                      <i className="fa fa-trash btn" aria-hidden="true" />
                    </span>
                  </span>
                </li>
              ))}
          </ul>
          <br />
          Add a new label:
          <form onSubmit={event => onSubmit(event, selectedLabelTypeId)}>
            <label>
              Name <input id="newLabelName" name="newLabelName" required />
            </label>
            <label>
              Color:{' '}
              <input
                id="newLabelColor"
                name="newLabelColor"
                type="color"
                required
              />
            </label>
            {selectedLabelTypeId === priorityLabelId && (
              <label>
                Priority:
                <input
                  id="newLabelPriority"
                  name="newLabelPriority"
                  required
                  type="number"
                />
              </label>
            )}
            <article className={b('action')}>
              <button type="submit">Add Label</button>
            </article>
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
    selectedLabelTypeId: state.adminLabels.selectedLabelTypeId,
  }),
  dispatch => ({
    onDeleteLabel: labelId => {
      dispatch(deleteLabel(labelId))
    },
    onSubmit: (event, selectedLabelTypeId) => {
      event.preventDefault()
      const NewLabel = {
        label_type_id: selectedLabelTypeId,
        label_name: event.target.newLabelName.value,
        label_color: event.target.newLabelColor.value,
      }
      const NewPriorityValue = event.target.newLabelPriority
        ? +event.target.newLabelPriority.value
        : null
      dispatch(addLabelAndPriority(NewLabel, NewPriorityValue))
      event.target.reset()
    },
    onTypeChange: value => {
      dispatch(updateSelectedLabelType(+value))
    },
    sync: () => {
      dispatch(setLoading('adminLabels'))
      dispatch(fetchLabels())
    },
  })
)(Labels)
