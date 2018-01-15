import './Milestone.sass'

import { format } from 'date-fns'
import React from 'react'

import {
  milestoneOnEdition,
  updateMilestoneCircles,
} from '../actions/milestones'
import { block, connect } from '../utils'
import Progress from './Progress'

const b = block('Milestone')

function getSelectedCircles(circleSelect) {
  const selectedCircles = []
  for (let i = 0; i < circleSelect.options.length; i++) {
    const selectedCircle = circleSelect.options[i]
    if (selectedCircle.selected) {
      selectedCircles.push({ circle_id: +selectedCircle.value })
    }
  }
  return selectedCircles
}

function Milestone(props) {
  return (
    <li className={b({ status: props.state })}>
      <span className={b('day')}>
        {format(new Date(props.due_on), 'DD/MM/YYYY')}
      </span>
      <span className={b('repo')}>{props.repo}</span>
      <a className={b('link')} href={props.html_url}>
        {props.title}
      </a>
      <Progress
        val={props.closed_issues}
        total={props.open_issues + props.closed_issues}
      />
      {props.is_in_edition ? (
        <form
          onSubmit={e => {
            e.preventDefault()
          }}
        >
          <select
            className={b('circles')}
            id="circles"
            multiple
            name="circles[]"
            size={props.circles.length}
          >
            {props.circles.map(circle => (
              <option key={circle.circle_id} value={circle.circle_id}>
                {circle.circle_name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className={b('btn')}
            onClick={event => props.onSave(props.milestone_id, event)}
          >
            Save
          </button>
          <button
            type="submit"
            className={b('btn')}
            onClick={() => props.onChangeMilestoneEdition(props.milestone_id)}
          >
            Cancel
          </button>
        </form>
      ) : (
        <span className={b('unlink')} title="Add to a circle">
          <i
            className="fa fa-plus-circle addCircle"
            aria-hidden="true"
            onClick={() => props.onChangeMilestoneEdition(props.milestone_id)}
          />
        </span>
      )}
    </li>
  )
}
export default connect(
  () => ({}),
  dispatch => ({
    onChangeMilestoneEdition: milestoneId => {
      dispatch(milestoneOnEdition(milestoneId))
    },
    onSave: (milestoneId, e) => {
      const selectedCircles = getSelectedCircles(e.target.form.circles)
      dispatch(updateMilestoneCircles(milestoneId, selectedCircles))
    },
  })
)(Milestone)
