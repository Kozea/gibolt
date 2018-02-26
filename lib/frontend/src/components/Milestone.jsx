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

function isAssociatedCircles(circles, assocCircles) {
  return circles
    .filter(circle =>
      assocCircles.find(
        assocCircle => assocCircle.circle_id === circle.circle_id
      )
    )
    .map(circle => circle.circle_id)
}

function Milestone(props) {
  return (
    <li className={b({ status: props.state })}>
      <span className={b('day')}>
        {props.due_on
          ? format(new Date(props.due_on), 'DD/MM/YYYY')
          : 'no due date'}
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
            defaultValue={isAssociatedCircles(
              props.circles,
              props.assoc_circles
            )}
          >
            {props.circles.map(circle => (
              <option
                key={circle.circle_id}
                value={circle.circle_id}
                disabled={circle.label_id === null}
              >
                {circle.circle_name} {circle.label_id === null && ' (No label)'}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className={b('btn')}
            onClick={event =>
              props.onSave(props.milestone_number, props.repo, event)
            }
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
        <span>
          {props.assoc_circles.map(assocCircle =>
            props.circles
              .filter(circle => circle.circle_id === assocCircle.circle_id)
              .map(
                circle =>
                  circle.label_id &&
                  props.labels
                    .filter(label => label.label_id === circle.label_id)
                    .map(label => (
                      <span
                        key={label.label_id}
                        className={b('tag')}
                        style={{
                          borderColor: label.color,
                        }}
                      >
                        {label.text}
                      </span>
                    ))
              )
          )}
          <span className={b('unlink')} title="Add to a circle">
            <i
              className="fa fa-edit addCircle"
              aria-hidden="true"
              onClick={() => props.onChangeMilestoneEdition(props.milestone_id)}
            />
          </span>
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
    onSave: (milestoneNumber, repoName, e) => {
      const selectedCircles = getSelectedCircles(e.target.form.circles)
      dispatch(
        updateMilestoneCircles(milestoneNumber, repoName, selectedCircles)
      )
    },
  })
)(Milestone)
