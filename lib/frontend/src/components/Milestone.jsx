import './Milestone.sass'

import { format } from 'date-fns'
import React from 'react'

import {
  getOptionsCircleLabels,
  getSelectedCircles,
  milestoneOnEdition,
  updateMilestoneCircles,
} from '../actions/milestones'
import { block, connect } from '../utils'
import Progress from './Progress'
import LabelMultiSelect from './Utils/LabelMultiSelect'

const b = block('Milestone')

function Milestone(props) {
  const allValues = getOptionsCircleLabels(
    props.assoc_circles,
    props.circles,
    props.labels
  )
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
          id="updateCircleForm"
          onSubmit={e => {
            e.preventDefault()
          }}
        >
          <LabelMultiSelect
            closeOnSelect={false}
            options={allValues.options}
            removeSelected
            value={allValues.milestoneCirclesValues}
          />
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
            type="button"
            className={b('btn')}
            onClick={() => props.onChangeMilestoneEdition(props.milestone_id)}
          >
            Cancel
          </button>
        </form>
      ) : (
        <span>
          {allValues.milestoneCirclesValues.map(circle => (
            <span
              key={circle.value}
              className={b('tag')}
              style={{
                borderColor: circle.color,
              }}
            >
              {circle.label}
            </span>
          ))}
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
      const selectedCircles = getSelectedCircles(e.target.form.labelMultiSelect)
      dispatch(
        updateMilestoneCircles(milestoneNumber, repoName, selectedCircles)
      )
    },
  })
)(Milestone)
