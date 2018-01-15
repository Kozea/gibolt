import './Circle.sass'

import { stringify } from 'query-string'
import React from 'react'
import { Link, withRouter } from 'react-router-dom'

import { checkAccountabilities, delAccountabilities } from '../../actions'
import {
  deleteCircle,
  editCircle,
  toggleAccountExpanded,
  toggleDomainExpanded,
  togglePurposeExpanded,
  updateCircle,
} from '../../actions/circle'
import { connect } from '../../utils'
import MarkdownEditor from './../MarkdownEditor'

var ReactMarkdown = require('react-markdown')

class CircleDetails extends React.Component {
  componentWillMount() {}

  render() {
    const {
      cancelClick,
      circle,
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

    return (
      <div>
        {isCircleInEdition ? (
          <form
            onSubmit={e => {
              e.preventDefault()
              onEdit(circle.circle_id, e)
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
            <button type="submit">Edit</button>
            <button type="submit" onClick={() => cancelClick()}>
              Cancel
            </button>
          </form>
        ) : (
          <div>
            <h1>
              {circle.circle_name}
              {circle.is_active ? '' : ' (disabled)'}{' '}
              <span
                onClick={() => editClick(circle.circle_accountabilities)}
                disabled={!circle.is_active}
                title="Edit circle"
              >
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
                  {circle.roles.length === 0 && (
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
              circle.roles.length > 0 && (
                <div>
                  <code>
                    {'You cannot delete this circle, '}
                    {'please first delete the roles.'}
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
      circles: state.circles.results,
      isCircleInEdition: state.circle.is_in_edition,
    }),
    dispatch => ({
      editClick: content => {
        dispatch(editCircle())
        dispatch(checkAccountabilities(content))
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
        if (e.target.elements[1].value === '') {
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
            .call(e.target.elements)
            .reduce(function(map, obj) {
              if (obj.name === 'parent_circle_id') {
                map[obj.name] = +obj.value
              } else if (obj.name) {
                map[obj.name] = obj.value
              }
              return map
            }, {})
        }
        formCircle.is_active = true
        dispatch(updateCircle(id, formCircle))
        dispatch(delAccountabilities())
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
        dispatch(delAccountabilities())
      },
    })
  )(CircleDetails)
)
