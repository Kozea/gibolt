import './AddLabel.sass'

import block from 'bemboo'
import React from 'react'

import { checkPriorityUniqueness } from '../../actions/labels'

@block
export default class AddLabel extends React.PureComponent {
  render(b) {
    const { labels, selectedLabelType, onLabelSubmit } = this.props
    return (
      <section className={b}>
        Add a new label:
        <form
          id="addLabelForm"
          onSubmit={event =>
            onLabelSubmit(event, selectedLabelType, 'creation')
          }
        >
          <label>
            Name <input id="newLabelName" name="labelName" required />
          </label>
          <label>
            Color:{' '}
            <input id="newLabelColor" name="labelColor" type="color" required />
          </label>
          {selectedLabelType === 'priority' && (
            <label>
              Priority:
              <input
                id="newLabelPriority"
                min="0"
                name="labelPriority"
                onChange={event =>
                  checkPriorityUniqueness(event, labels.priority)
                }
                required
                type="number"
              />
            </label>
          )}
          <article className={b.e('action')}>
            <button type="submit">Add Label</button>
          </article>
        </form>
      </section>
    )
  }
}
