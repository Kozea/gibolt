import './CreateCircle.sass'

import React from 'react'
import { Helmet } from 'react-helmet'
import { withRouter } from 'react-router-dom'

import { fetchResults, goBack, setLoading } from '../actions'
import { createCircle } from '../actions/circle'
import {
  getUnusedCircleLabels,
  labelSubmit,
  updateSelectedLabel,
} from '../actions/labels'
import { block, connect } from '../utils'
import AddLabel from './Admin/AddLabel'
import Loading from './Loading'
import MarkdownEditor from './Utils/MarkdownEditor'

const b = block('CreateCircle')

class CreateCircle extends React.Component {
  componentDidMount() {
    this.props.sync()
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.circleLabels !== this.propscircleLabels) {
      this.setState({
        displayAddLabels: false,
      })
    }
  }

  displayAddLabels(labelSelectValue) {
    this.props.onLabelChange(labelSelectValue)
  }

  render() {
    const {
      circles,
      circleLabels,
      history,
      loading,
      onGoBack,
      onLabelSubmit,
      onSubmit,
      selectedLabel,
    } = this.props
    const unusedLabels = getUnusedCircleLabels(circles, circleLabels)

    return (
      <article className={b()}>
        <Helmet>
          <title>Gibolt - Create a circle</title>
        </Helmet>
        <div className={b('createCircle')}>
          {loading && <Loading />}
          <h2>Create a new circle :</h2>
          {selectedLabel === 'AddLabel' && (
            <AddLabel
              adminLabels={circleLabels}
              selectedLabelTypeId={'circle'}
              onLabelSubmit={event =>
                onLabelSubmit(event, 'circle', 'creation')
              }
            />
          )}
          <form onSubmit={e => onSubmit(e, history)}>
            <label>
              Name :
              <input name="circle_name" required />
            </label>
            <br />
            <label>
              Label :
              <select
                name="label_id"
                onChange={event => this.displayAddLabels(event.target.value)}
                value={selectedLabel}
                required
              >
                <option value="" />
                {unusedLabels.map(label => (
                  <option key={label.label_id} value={label.label_id}>
                    {label.text}
                  </option>
                ))}
                <option value="AddLabel">Add a label...</option>
              </select>
            </label>
            <br />
            <label>
              Parent :
              <select name="parent_circle_id" defaultValue="">
                {circles
                  .filter(circle => circle.parent_circle_id === null)
                  .map(circle => (
                    <option key={circle.circle_id} value={circle.circle_id}>
                      {circle.circle_name}
                    </option>
                  ))}
                <option value="">Aucun</option>
              </select>
            </label>
            <br />
            <label>
              Purpose :
              <input name="circle_purpose" required />
            </label>
            <br />
            <label>
              Domain :
              <MarkdownEditor editorName="circle_domain" />
            </label>
            <br />
            <label>
              Accountabilities :
              <MarkdownEditor editorName="circle_accountabilities" />
            </label>
            <br />
            <button type="submit">Create circle</button>
            <button type="button" onClick={() => onGoBack(history)}>
              Cancel
            </button>
          </form>
        </div>
      </article>
    )
  }
}

export default withRouter(
  connect(
    state => ({
      circles: state.circles.results,
      circleLabels: state.labels.results.circle,
      loading: state.circles.loading,
      error: state.circles.errors,
      selectedLabel: state.labels.selectedLabel,
    }),
    dispatch => ({
      onGoBack: history => {
        dispatch(goBack(history))
      },
      onLabelChange: label => {
        dispatch(updateSelectedLabel(label))
      },
      onLabelSubmit: (event, selectedLabelType, actionType, label = null) => {
        event.preventDefault()
        dispatch(labelSubmit(event, selectedLabelType, actionType, label))
        event.target.reset()
      },
      onSubmit: (e, history) => {
        e.preventDefault()
        const formCircle = [].slice
          .call(e.target.elements)
          .reduce(function(map, obj) {
            if (obj.name && obj.value) {
              map[obj.name] = obj.value
            }
            return map
          }, {})
        dispatch(createCircle(formCircle, history))
      },
      sync: () => {
        dispatch(setLoading('labels'))
        dispatch(fetchResults('labels'))
        dispatch(setLoading('circles'))
        dispatch(fetchResults('circles'))
      },
    })
  )(CreateCircle)
)
