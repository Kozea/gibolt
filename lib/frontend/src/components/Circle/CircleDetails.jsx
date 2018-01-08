import './Circle.sass'

import React from 'react'

import { editCircle } from '../../actions'
import {
  deleteCircle,
  toggleAccountExpanded,
  toggleDomainExpanded,
  togglePurposeExpanded,
  updateCircle,
} from '../../actions/circle'
import { connect } from '../../utils'
import MarkdownEditor from './../MarkdownEditor'

var ReactMarkdown = require('react-markdown')

function Circle({
  btnClick,
  circle,
  circles,
  editClick,
  isCircleInEdition,
  onClickAccount,
  onClickDomain,
  onClickPurpose,
  onEdit,
}) {
  return (
    <div>
      {isCircleInEdition ? (
        <form
          onSubmit={e => {
            e.preventDefault()
            onEdit(circle.circle_id, e)
          }}
        >
          <h1>Edit {circle.circle_name} circle :</h1>
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
            <select name="parent_circle_id" required>
              {circle.parent_circle_id === null ? (
                <option value=""> Aucun </option>
              ) : (
                <option defaultValue={circle.parent_circle_id}>
                  {circle.parent_circle_name}
                </option>
              )}
              {circles
                .filter(cercle => cercle.circle_id !== circle.circle_id)
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
          <button type="submit" onClick={() => editClick()}>
            Cancel
          </button>
        </form>
      ) : (
        <div>
          <article>
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
          <article>
            <button type="submit" onClick={() => editClick()}>
              {isCircleInEdition ? 'Cancel' : 'Update'}
            </button>
            {(circle.roles && circle.roles.length > 0) ||
              circle.nb_reports > 0 ? (
                <span>
                  <button type="submit" disabled>
                    Delete
                  </button>
                  <br />
                  <code>
                    {'You cannot delete this circle, '}
                    {circle.nb_reports > 0 ? (
                      <code>{'meetings reports exist.'}</code>
                    ) : (
                      <code>{'please first delete the roles.'}</code>
                    )}
                  </code>
                </span>
              ) : (
                <button
                  type="submit"
                  onClick={e => {
                    e.preventDefault()
                    btnClick(circle.circle_id)
                  }}
                >
                  Delete
              </button>
            )}
          </article>
        </div>
      )}
    </div>
  )
}

export default connect(
  state => ({
    circle: state.circle.results,
    circles: state.circles.results,
    isCircleInEdition: state.circle.is_in_edition,
  }),
  dispatch => ({
    btnClick: data => {
      dispatch(deleteCircle(data))
    },
    editClick: () => {
      dispatch(editCircle())
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
          } else if (obj.name) {
            map[obj.name] = obj.value
          }

          return map
        }, {})
      } else {
        formCircle = [].slice
          .call(e.target.elements)
          .reduce(function(map, obj) {
            if (obj.name) {
              map[obj.name] = obj.value
            }

            return map
          }, {})
      }
      dispatch(updateCircle(id, formCircle))
    },
  })
)(Circle)