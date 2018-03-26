import './Circle.sass'

import React from 'react'

import MilestoneDisplay from './../Utils/MilestoneDisplay'
import { connect } from '../../utils'

const sortMilestones = milestones => {
  milestones.sort(function(a, b) {
    if (!a.milestone || !b.milestone) {
      return
    }
    return `${a.milestone.repo.toLowerCase()}-${a.milestone.due_on}` >
      `${b.milestone.repo.toLowerCase()}-${b.milestone.due_on}`
      ? 1
      : `${b.milestone.repo.toLowerCase()}-${b.milestone.due_on}` >
        `${a.milestone.repo.toLowerCase()}-${a.milestone.due_on}`
        ? -1
        : 0
  })
  return milestones
}

class CircleMilestones extends React.Component {
  componentDidMount() {}

  render() {
    const { circle } = this.props
    sortMilestones(circle.circle_milestones)
    return (
      <article>
        <h3>Milestones</h3>
        {circle.circle_milestones.length > 0 ? (
          <ul>
            {circle.circle_milestones.map(
              milestone =>
                milestone.milestone && (
                  <li
                    key={milestone.milestone.id}
                    title={milestone.milestone.description}
                  >
                    {milestone.milestone && (
                      <span>
                        <MilestoneDisplay
                          circleId={circle.circle_id}
                          displayProgress={false}
                          isInEdition
                          milestone={milestone.milestone}
                          target="circle"
                        />
                      </span>
                    )}
                  </li>
                )
            )}
          </ul>
        ) : (
          'No milestones associated to this circle.'
        )}
      </article>
    )
  }
}

export default connect(() => ({}))(CircleMilestones)
