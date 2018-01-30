import './AddLabel.sass'

import React from 'react'

import { block } from '../../utils'

const b = block('AddLabel')

export default function AddLabel(props) {
  const {
    adminLabels,
    priorityLabelId,
    selectedLabelTypeId,
    onLabelSubmit,
  } = props
  return (
    <section className={b()}>
      <form
        id="addLabelForm"
        onSubmit={event =>
          onLabelSubmit(event, selectedLabelTypeId, 'creation')
        }
      >
        <label>
          Name <input id="newLabelName" name="labelName" required />
        </label>
        <label>
          Color:{' '}
          <input id="newLabelColor" name="labelColor" type="color" required />
        </label>
        {selectedLabelTypeId === priorityLabelId && (
          <label>
            Priority:
            <input
              id="newLabelPriority"
              min="0"
              name="labelPriority"
              onChange={event =>
                this.checkPriorityUniqueness(
                  event,
                  priorityLabelId,
                  adminLabels.labels
                )
              }
              required
              type="number"
            />
          </label>
        )}
        <article className={b('action')}>
          <button type="submit">Add Label</button>
        </article>
      </form>
    </section>
  )
}
