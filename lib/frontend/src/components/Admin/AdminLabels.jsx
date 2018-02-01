import './AdminLabels.sass'

import React from 'react'

import { fetchResults, setLoading } from '../../actions'
import {
  checkPriorityUniqueness,
  deleteLabel,
  disableLabelEdition,
  enableLabelEdition,
  labelSubmit,
  updateSelectedLabelType,
} from '../../actions/labels'
import { block, connect } from '../../utils'
import AddLabel from './AddLabel'
import Loading from './../Loading'

const b = block('AdminLabels')

function isLabelAssociatedToCircle(labelId, circles) {
  return circles.filter(circle => circle.label_id === labelId).length > 0
}

class Labels extends React.Component {
  constructor(props) {
    super(props)
    this.checkPriorityUniqueness = checkPriorityUniqueness.bind(this)
  }

  componentDidMount() {
    this.props.sync()
  }

  render() {
    const {
      circles,
      error,
      labels,
      loading,
      onCancelLabelEdition,
      onDeleteLabel,
      onEnableLabelEdition,
      onSubmit,
      onTypeChange,
      selectedLabelType,
    } = this.props
    const labelTypes = ['ack', 'circle', 'priority', 'qualifier']
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
              value={selectedLabelType}
            >
              {labelTypes.map(labelType => (
                <option key={labelType} value={labelType}>
                  {labelType}
                </option>
              ))}
            </select>
          </label>
          <br />
          <label>Labels</label>
          <ul>
            {labels[selectedLabelType] &&
              labels[selectedLabelType].map(label => (
                <li
                  className={b('item')}
                  key={label.label_id}
                  style={{
                    color: label.color,
                  }}
                >
                  <span className={b('text')}>
                    {label.isLabelInEdition ? (
                      <form
                        className={b('labelEdition')}
                        onSubmit={event =>
                          onSubmit(event, selectedLabelType, 'edition', label)
                        }
                      >
                        <input
                          className="labelInput"
                          id="labelName"
                          name="labelName"
                          defaultValue={label.text}
                          required
                        />
                        <input
                          className="labelColor"
                          id="labelColor"
                          defaultValue={label.color}
                          name="labelColor"
                          type="color"
                          required
                        />
                        {selectedLabelType === 'priority' && (
                          <input
                            className="labelPriority"
                            id="labelPriority"
                            defaultValue={label.priority}
                            min={0}
                            name="labelPriority"
                            onChange={event =>
                              this.checkPriorityUniqueness(
                                event,
                                labels.priority
                              )
                            }
                            required
                            type="number"
                          />
                        )}
                        <button className="labelBtn">Edit</button>
                        <button
                          className="labelBtn"
                          onClick={() =>
                            onCancelLabelEdition(
                              selectedLabelType,
                              label.label_id
                            )
                          }
                        >
                          Cancel
                        </button>
                      </form>
                    ) : (
                      <span>
                        {label.text}
                        {(label.priority || label.priority === 0) &&
                          ` (priority: ${label.priority})`}
                        {selectedLabelType === 'circle' &&
                          isLabelAssociatedToCircle(
                            label.label_id,
                            circles
                          ) && (
                            <span className={b('association')}>
                              {`associated to '${circles
                                .filter(
                                  circle => circle.label_id === label.label_id
                                )
                                .map(circle => circle.circle_name)
                                .toString()}'`}
                            </span>
                          )}
                        <span
                          onClick={() =>
                            onEnableLabelEdition(
                              selectedLabelType,
                              label.label_id
                            )
                          }
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
          <AddLabel
            labels={labels}
            selectedLabelType={selectedLabelType}
            onLabelSubmit={event =>
              onSubmit(event, selectedLabelType, 'creation')
            }
          />
        </article>
      </section>
    )
  }
}

export default connect(
  state => ({
    circles: state.circles.results,
    error: state.labels.error,
    labels: state.labels.results,
    loading: state.labels.loading,
    selectedLabelType: state.labels.selectedLabelType,
  }),
  dispatch => ({
    onCancelLabelEdition: (selectedLabelType, labelId) => {
      dispatch(disableLabelEdition(selectedLabelType, labelId))
    },
    onDeleteLabel: labelId => {
      dispatch(deleteLabel(labelId))
    },
    onEnableLabelEdition: (selectedLabelType, labelId) => {
      dispatch(enableLabelEdition(selectedLabelType, labelId))
    },
    onSubmit: (event, selectedLabelType, actionType, label = null) => {
      event.preventDefault()
      dispatch(labelSubmit(event, selectedLabelType, actionType, label))
      event.target.reset()
    },
    onTypeChange: labelType => {
      dispatch(updateSelectedLabelType(labelType))
    },
    sync: () => {
      dispatch(setLoading('labels'))
      dispatch(fetchResults('labels'))
      dispatch(setLoading('circles'))
      dispatch(fetchResults('circles'))
    },
  })
)(Labels)
