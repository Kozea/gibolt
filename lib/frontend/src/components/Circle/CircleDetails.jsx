import './Circle.sass'

import { stringify } from 'query-string'
import React from 'react'
import { Link, withRouter } from 'react-router-dom'

import { updateMarkdown } from '../../actions'
import {
  deleteCircle,
  editCircle,
  toggleAccountExpanded,
  toggleDomainExpanded,
  togglePurposeExpanded,
  updateCircle,
} from '../../actions/circle'
import { getUnusedCircleLabels } from '../../actions/labels'
import { block, connect } from '../../utils'
import MarkdownEditor from './../Utils/MarkdownEditor'

var ReactMarkdown = require('react-markdown')

const b = block('Circle')

class CircleDetails extends React.Component {
  componentWillMount() {}

  render() {
    const {
      cancelClick,
      circle,
      circleLabels,
      circles,
      editClick,
      history,
      isCircleInEdition,
      onClickAccount,
      onClickDomain,
      onClickPurpose,
      onEdit,
      onDelete,
      onDisableCircle,
    } = this.props
    const unusedLabels = getUnusedCircleLabels(circles, circleLabels)

    return (
      <div>
        {isCircleInEdition ? (
          <form
            onSubmit={e => {
              e.preventDefault()
            }}
          >
            {' '}
            <h1>
              {circle.circle_name}
              {circle.is_active ? '' : ' (disabled)'}
            </h1>
            <br />
            <label>
              Name :
              <input
                name="circle_name"
                defaultValue={circle.circle_name}
                required
              />
            </label>
            <br />
            <label>
              Label :
              <select name="label_id">
                {circle.label_id !== null && (
                  <option value={circle.label_id}>
                    {circleLabels
                      .filter(label => label.label_id === circle.label_id)
                      .map(label => label.text)
                      .toString()}
                  </option>
                )}
                {unusedLabels.map(label => (
                  <option key={label.label_id} value={label.label_id}>
                    {label.text}
                  </option>
                ))}
              </select>
            </label>
            <br />
            <label>
              Parent :
              <select name="parent_circle_id">
                {circle.parent_circle_id !== null && (
                  <option value={circle.parent_circle_id}>
                    {circle.parent_circle_name}
                  </option>
                )}
                <option value=""> Aucun </option>
                {circles
                  .filter(
                    cercle =>
                      cercle.circle_id !== circle.circle_id &&
                      cercle.parent_circle_id !== circle.circle_id &&
                      cercle.circle_id !== circle.parent_circle_id
                  )
                  .map(cercle => (
                    <option key={cercle.circle_id} value={cercle.circle_id}>
                      {cercle.circle_name}
                    </option>
                  ))}
              </select>
            </label>
            <br />
            <label>
              Purpose :
              <input
                name="circle_purpose"
                defaultValue={circle.circle_purpose}
                required
              />
            </label>
            <br />
            <label>
              Domain :
              <input
                name="circle_domain"
                defaultValue={circle.circle_domain}
                required
              />
            </label>
            <br />
            <label>
              Accountabilities :
              <MarkdownEditor />
            </label>
            <br />
            <button type="submit" onClick={e => onEdit(circle.circle_id, e)}>
              Edit
            </button>
            <button type="submit" onClick={() => cancelClick()}>
              Cancel
            </button>
          </form>
        ) : (
          <div>
            <h1>
              {circle.circle_name}
              {circle.is_active ? '' : ' (disabled)'}{' '}
              {circle.label_id &&
                circleLabels
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
                  ))}
              <span
                onClick={() => editClick(circle.circle_accountabilities)}
                disabled={!circle.is_active}
                title="Edit circle"
              >
                {' '}
                <i className="fa fa-pencil-square-o" aria-hidden="true" />
              </span>{' '}
              {circle.nb_reports > 0 ? (
                <span
                  onClick={e => {
                    e.preventDefault()
                    onDisableCircle(circle)
                  }}
                  disabled={
                    circle.parent_circle_id === null
                      ? false
                      : !circle.parent_circle_is_active
                  }
                  title={circle.is_active ? 'Disable circle' : 'Enable circle'}
                >
                  {circle.is_active ? (
                    <i className="fa fa-ban" aria-hidden="true" />
                  ) : (
                    <i className="fa fa-unlock" aria-hidden="true" />
                  )}
                </span>
              ) : (
                <span>
                  {circle.roles.length === 0 &&
                    circle.circle_milestones.length === 0 && (
                      <span
                        onClick={e => {
                          e.preventDefault()
                          onDelete(circle.circle_id, history)
                        }}
                        disabled={circle.roles.length > 0}
                        title="Delete circle"
                      >
                        <i className="fa fa-trash" aria-hidden="true" />
                      </span>
                    )}
                </span>
              )}
            </h1>
            {circle.parent_circle_name && (
              <span>
                {circle.parent_circle_name ? (
                  <Link
                    to={{
                      pathname: '/circle',
                      search: stringify({
                        circle_id: circle.parent_circle_id,
                      }),
                    }}
                  >
                    {`(sous-cercle de "${circle.parent_circle_name}")`}
                  </Link>
                ) : (
                  ''
                )}
              </span>
            )}{' '}
            {circle.nb_reports === 0 &&
              (circle.roles.length > 0 ||
                circle.circle_milestones.length > 0) && (
                <div>
                  <code>
                    {'You cannot delete this circle, please first: '}
                    {circle.roles.length > 0 && (
                      <span>
                        <br />
                        - delete the roles
                      </span>
                    )}
                    {circle.circle_milestones.length > 0 && (
                      <span>
                        <br />
                        - dissociate milestones
                      </span>
                    )}
                  </code>
                </div>
              )}
            <article>
              <h3>Details</h3>
              <h4>Purpose</h4>
              <div onClick={() => onClickPurpose(circle.purpose_expanded)}>
                {circle.purpose_expanded ? (
                  <p>{circle.circle_purpose}</p>
                ) : (
                  <span>show purpose</span>
                )}
              </div>
              <h4>Domains</h4>
              <div onClick={() => onClickDomain(circle.domain_expanded)}>
                {circle.domain_expanded ? (
                  <p>{circle.circle_domain}</p>
                ) : (
                  <span>show domain</span>
                )}
              </div>
              <h4>Accountabilities</h4>
              <div
                onClick={() => onClickAccount(circle.accountabilities_expanded)}
              >
                {circle.accountabilities_expanded ? (
                  <ReactMarkdown source={circle.circle_accountabilities} />
                ) : (
                  <span>show accountabilities</span>
                )}
              </div>
            </article>
          </div>
        )}
      </div>
    )
  }
}

export default withRouter(
  connect(
    state => ({
      circle: state.circle.results,
      circleLabels: state.labels.results.circle,
      circles: state.circles.results,
      isCircleInEdition: state.circle.is_in_edition,
    }),
    dispatch => ({
      editClick: content => {
        dispatch(editCircle())
        dispatch(updateMarkdown(content))
      },
      onClickAccount: circleAccount => {
        dispatch(toggleAccountExpanded(circleAccount))
      },
      onClickDomain: circleDomain => {
        dispatch(toggleDomainExpanded(circleDomain))
      },
      onClickPurpose: circlePurpose => {
        dispatch(togglePurposeExpanded(circlePurpose))
      },
      onDelete: (data, history) => {
        dispatch(deleteCircle(data, history))
      },
      onEdit: (id, e) => {
        let formCircle = []
        if (e.target.form.elements[1].value === '') {
          formCircle = [
            e.target.elements[0],
            e.target.elements[2],
            e.target.elements[3],
            e.target.elements[4],
            e.target.elements[5],
          ].reduce(function(map, obj) {
            if (obj.name === 'body') {
              map.circle_accountabilities = obj.value
            } else if (obj.name === 'parent_circle_id') {
              map[obj.name] = +obj.value
            } else if (obj.name) {
              map[obj.name] = obj.value
            }
            return map
          }, {})
        } else {
          formCircle = [].slice
            .call(e.target.form.elements)
            .reduce(function(map, obj) {
              if (obj.name === 'body') {
                map.circle_accountabilities = obj.value
              } else if (obj.name === 'parent_circle_id') {
                map[obj.name] = obj.value === '' ? null : +obj.value
              } else if (obj.name) {
                map[obj.name] = obj.value
              }
              return map
            }, {})
        }
        formCircle.is_active = true
        dispatch(updateCircle(id, formCircle))
        dispatch(updateMarkdown(''))
      },
      onDisableCircle: circle => {
        const circleData = {}
        circleData.parent_circle_id = circle.parent_circle_id
        circleData.circle_name = circle.circle_name
        circleData.circle_purpose = circle.circle_purpose
        circleData.circle_domain = circle.circle_domain
        circleData.circle_accountabilities = circle.circle_accountabilities
        circleData.is_active = !circle.is_active
        dispatch(updateCircle(circle.circle_id, circleData))
      },
      cancelClick: () => {
        dispatch(editCircle())
        dispatch(updateMarkdown(''))
      },
    })
  )(CircleDetails)
)
