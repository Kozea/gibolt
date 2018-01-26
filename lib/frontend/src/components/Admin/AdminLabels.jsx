import './AdminLabels.sass'

import React from 'react'

import { setLoading } from '../../actions'
import {
  addOrEditLabelAndPriority,
  deleteLabel,
  disableLabelEdition,
  enableLabelEdition,
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
      onCancelLabelEdition,
      onDeleteLabel,
      onEnableLabelEdition,
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
                    {label.isLabelInEdition ? (
                      <form
                        className={b('labelEdition')}
                        onSubmit={event =>
                          onSubmit(event, selectedLabelTypeId, 'edition', label)
                        }
                      >
                        <input
                          className="labelInput"
                          id="labelName"
                          name="labelName"
                          defaultValue={label.label_name}
                          required
                        />
                        <input
                          className="labelColor"
                          id="labelColor"
                          defaultValue={label.label_color}
                          name="labelColor"
                          type="color"
                          required
                        />
                        {selectedLabelTypeId === priorityLabelId && (
                          <input
                            className="labelPriority"
                            id="labelPriority"
                            defaultValue={label.priorities[0].value}
                            name="labelPriority"
                            required
                            type="number"
                          />
                        )}
                        <button className="labelBtn">Edit</button>
                        <button
                          className="labelBtn"
                          onClick={() => onCancelLabelEdition(label.label_id)}
                        >
                          Cancel
                        </button>
                      </form>
                    ) : (
                      <span>
                        {label.label_name}
                        {label.priorities[0] &&
                          ` (priority: ${label.priorities[0].value})`}
                        <span
                          onClick={() => onEnableLabelEdition(label.label_id)}
                          title="Edit label"
                        >
                          <i className="fa fa-edit btn" aria-hidden="true" />
                        </span>
                        <span
                          onClick={() => onDeleteLabel(label.label_id)}
                          title="Delete label"
                        >
                          <i className="fa fa-trash btn" aria-hidden="true" />
                        </span>
                      </span>
                    )}
                  </span>
                </li>
              ))}
          </ul>
          <br />
          Add a new label:
          <form
            onSubmit={event => onSubmit(event, selectedLabelTypeId, 'creation')}
          >
            <label>
              Name <input id="newLabelName" name="labelName" required />
            </label>
            <label>
              Color:{' '}
              <input
                id="newLabelColor"
                name="labelColor"
                type="color"
                required
              />
            </label>
            {selectedLabelTypeId === priorityLabelId && (
              <label>
                Priority:
                <input
                  id="newLabelPriority"
                  name="labelPriority"
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
    onCancelLabelEdition: labelId => {
      dispatch(disableLabelEdition(labelId))
    },
    onDeleteLabel: labelId => {
      dispatch(deleteLabel(labelId))
    },
    onEnableLabelEdition: labelId => {
      dispatch(enableLabelEdition(labelId))
    },
    onSubmit: (event, selectedLabelTypeId, actionType, label = null) => {
      event.preventDefault()
      const newLabel = {
        label_type_id: selectedLabelTypeId,
        label_name: event.target.labelName.value,
        label_color: event.target.labelColor.value,
      }
      if (actionType === 'edition') {
        newLabel.label_id = label.label_id
      }
      const priorityData = event.target.labelPriority
        ? actionType === 'edition'
          ? {
              priority_id: label.priorities[0].priority_id,
              value: +event.target.labelPriority.value,
            }
          : +event.target.labelPriority.value
        : null
      dispatch(addOrEditLabelAndPriority(newLabel, priorityData, actionType))
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
