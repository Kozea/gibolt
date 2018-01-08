import './Createcircle.sass'

import React from 'react'
import { Helmet } from 'react-helmet'
import { withRouter } from 'react-router-dom'

import { goBack } from '../actions'
import { createCircle } from '../actions/circle'
import { block, connect } from '../utils'
import Loading from './Loading'
import MarkdownEditor from './MarkdownEditor'

const b = block('Createcircle')

function Createcircle({ circles, history, loading, onGoBack, onSubmit }) {
  return (
    <article className={b()}>
      <Helmet>
        <title>Gibolt - Create a circle</title>
      </Helmet>
      {loading && <Loading />}
      <h2>Create a new circle :</h2>
      <form
        onSubmit={e => {
          e.preventDefault()
          onSubmit(e)
        }}
      >
        <label>
          Name :
          <input name="circle_name" required />
        </label>
        <br />
        <label>
          Parent :
          <select name="parent_circle_id" defaultValue="">
            {circles
              .filter(circle => circle.parent_circle_id === null)
              .map(circle => (
                <option key={circle.circle_id} value={circle.circle_id}>
                  {circle.circle_name}
                </option>
              ))}
            <option value="">Aucun</option>
          </select>
        </label>
        <br />
        <label>
          Purpose :
          <input name="circle_purpose" required />
        </label>
        <br />
        <label>
          Domain :
          <input name="circle_domain" required />
        </label>
        <br />
        <label>
          Accountabilities :
          <MarkdownEditor />
        </label>
        <br />
        <button type="submit"> Create circle</button>
        <button type="submit" onClick={() => onGoBack(history)}>
          Cancel
        </button>
      </form>
    </article>
  )
}

export default withRouter(
  connect(
    state => ({
      circles: state.circles.results,
      loading: state.circles.loading,
      error: state.circles.errors,
    }),
    dispatch => ({
      onGoBack: history => {
        dispatch(goBack(history))
      },
      onSubmit: e => {
        const formCircle = [].slice
          .call(e.target.elements)
          .reduce(function(map, obj) {
            if (obj.name === 'body') {
              map.circle_accountabilities = obj.value
            } else if (obj.name && obj.value) {
              map[obj.name] = obj.value
            }

            return map
          }, {})
        dispatch(createCircle(formCircle))
      },
    })
  )(Createcircle)
)
