import './MilestoneDisplay.sass'

import { format } from 'date-fns'
import React from 'react'

import Progress from './../Progress'
import {
  closeMilestone,
  deleteMilestoneCircles,
} from '../../actions/milestones'
import { block, connect } from '../../utils'

const b = block('MilestoneDisplay')

function MilestoneDisplay(props) {
  const {
    circleId,
    displayProgress,
    isInEdition,
    milestone,
    onMilestoneUpdate,
    target,
  } = props
  return (
    <span>
      <a className={b('unlink')} href={milestone.html_url} target="_blank">
        <span className={b(`bullet ${milestone.state}`)} />
        {milestone.repo}
        {' - '}
        <span className={b('lab')}>{milestone.title}</span>
      </a>
      {displayProgress && (
        <span>
          {' -'}
          <Progress
            val={milestone.closed_issues}
            total={milestone.open_issues + milestone.closed_issues}
          />
        </span>
      )}
      <span className={b('due-date')}>
        {' ('}
        {milestone.due_on
          ? `due on: ${format(new Date(milestone.due_on), 'DD/MM/YYYY')}`
          : 'no due date'}
        {')'}
      </span>
      {isInEdition && (
        <span>
          <span
            className={b('unlinkMilestone')}
            title="Unlink the milestone"
            onClick={() =>
              onMilestoneUpdate(milestone, circleId, target, false)
            }
          >
            <i className="fa fa-chain-broken" aria-hidden="true" />
          </span>
          {target === 'circle' &&
            milestone.state === 'open' && (
              <span
                title="Close and dissociate Milestone"
                onClick={() =>
                  onMilestoneUpdate(milestone, circleId, target, true)
                }
              >
                <i className="fa fa-times-circle" aria-hidden="true" />
              </span>
            )}
        </span>
      )}
    </span>
  )
}

export default connect(
  () => ({}),
  dispatch => ({
    onMilestoneUpdate: (milestone, circleId, target, milestoneToClose) => {
      Promise.resolve(
        dispatch(
          deleteMilestoneCircles(
            circleId,
            milestone.number,
            milestone.repo,
            target // to display error
          )
        ).then(() => {
          if (milestoneToClose) {
            dispatch(
              closeMilestone(
                milestone.number,
                milestone.repo,
                { state: 'closed' },
                target
              )
            )
          }
        })
      )
    },
  })
)(MilestoneDisplay)
