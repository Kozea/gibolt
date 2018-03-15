import './MilestoneDisplay.sass'

import { format } from 'date-fns'
import React from 'react'

import Progress from './../Progress'
import { deleteMilestoneCircles } from '../../actions/milestones'
import { block, connect } from '../../utils'

const b = block('MilestoneDisplay')

function MilestoneDisplay(props) {
  const {
    circleId,
    displayProgress,
    milestone,
    onMilestoneUnlink,
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
      <span
        className={b('unlinkMilestone')}
        title="Unlink the milestone"
        onClick={() => onMilestoneUnlink(milestone, circleId, target)}
      >
        <i className="fa fa-chain-broken" aria-hidden="true" />
      </span>
    </span>
  )
}

export default connect(
  () => ({}),
  dispatch => ({
    onMilestoneUnlink: (milestone, circleId, target) => {
      dispatch(
        deleteMilestoneCircles(
          circleId,
          milestone.number,
          milestone.repo,
          target // to display error
        )
      )
    },
  })
)(MilestoneDisplay)
