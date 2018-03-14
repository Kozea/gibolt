import './Circle.sass'

import React from 'react'

import MilestoneDisplay from './../Utils/MilestoneDisplay'
import { connect } from '../../utils'

class CircleMilestones extends React.Component {
  componentDidMount() {}

  render() {
    const { circle } = this.props
    return (
      <article>
        <h3>Milestones </h3>
        {circle.circle_milestones.length > 0 ? (
          <ul>
            {circle.circle_milestones.map(
              milestone =>
                milestone.milestone && (
                  <li key={milestone.milestone.id}>
                    {milestone.milestone && (
                      <MilestoneDisplay milestone={milestone.milestone} />
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
