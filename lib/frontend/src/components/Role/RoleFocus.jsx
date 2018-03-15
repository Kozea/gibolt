import React from 'react'

import { block, connect } from '../../utils'

const b = block('Role')

function RoleFocus(props) {
  const { focuses } = props
  return (
    <article>
      <h3>
        Focus{' '}
        <span
          // onClick={() => onAddItem(itemType)}
          className={b('unlink')}
          title="Add focus"
        >
          <i className="fa fa-plus-circle" aria-hidden="true" />
        </span>
      </h3>
      {focuses.length > 0 ? (
        <ul>
          {focuses.map(focus => (
            <li key={focus.role_focus_id}>
              <span className={b('bullet')} />
              {focus.focus_name}
            </li>
          ))}
        </ul>
      ) : (
        'No focus'
      )}
    </article>
  )
}

export default connect(() => ({}))(RoleFocus)
