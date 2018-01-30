import './Createcircle.sass'

import React from 'react'
import { Helmet } from 'react-helmet'
import { withRouter } from 'react-router-dom'

import { fetchResults, goBack, setLoading } from '../actions'
import { createCircle } from '../actions/circle'
import { labelSubmit } from '../actions/labels'
import { block, connect } from '../utils'
import AddLabel from './Admin/AddLabel'
import Loading from './Loading'
import MarkdownEditor from './MarkdownEditor'

const b = block('Createcircle')

function getUnusedCircleLabels(circles, labels) {
  const unusedLabels = labels.filter(
    label =>
      circles.filter(circle => circle.label_id === label.label_id).length === 0
  )
  return unusedLabels
}

class Createcircle extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      displayAddLabels: false,
    }
    this.displayAddLabels = this.displayAddLabels.bind(this)
  }

  componentDidMount() {
    this.props.sync()
  }

  displayAddLabels(labelSelectValue) {
    this.setState({
      displayAddLabels: labelSelectValue === '',
    })
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
    } = this.props
    const unusedLabels = getUnusedCircleLabels(circles, circleLabels)
    const { displayAddLabels } = this.state

    return (
      <article className={b()}>
        <Helmet>
          <title>Gibolt - Create a circle</title>
        </Helmet>
        {loading && <Loading />}
        <h2>Create a new circle :</h2>
        <form onSubmit={e => e.preventDefault()}>
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
            >
              {unusedLabels.map(label => (
                <option key={label.label_id} value={label.label_id}>
                  {label.text}
                </option>
              ))}
              <option value="">Add a label...</option>
            </select>
            {displayAddLabels && (
              <AddLabel
                adminLabels={circleLabels}
                priorityLabelId={null}
                selectedLabelTypeId={4}
                onLabelSubmit={event => onLabelSubmit(event, 4, 'creation')}
              />
            )}
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
            <input name="circle_domain" required />
          </label>
          <br />
          <label>
            Accountabilities :
            <MarkdownEditor />
          </label>
          <br />
          <button type="submit" onClick={e => onSubmit(e, history)}>
            Create circle
          </button>
          <button type="submit" onClick={() => onGoBack(history)}>
            Cancel
          </button>
        </form>
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
    }),
    dispatch => ({
      onGoBack: history => {
        dispatch(goBack(history))
      },
      onLabelSubmit: (event, selectedLabelTypeId, actionType, label = null) => {
        event.preventDefault()
        dispatch(labelSubmit(event, selectedLabelTypeId, actionType, label))
        event.target.reset()
      },
      onSubmit: (e, history) => {
        e.preventDefault()
        const formCircle = [].slice
          .call(e.target.form.elements)
          .reduce(function(map, obj) {
            if (obj.name === 'body') {
              map.circle_accountabilities = obj.value
            } else if (obj.name && obj.value) {
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
  )(Createcircle)
)
