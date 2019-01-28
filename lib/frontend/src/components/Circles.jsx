import './Circles.sass'

import block from 'bemboo'
import React from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'

import { fetchResults, setLoading } from '../actions'
import { createCircle } from '../actions/circle'
import { connect, sortGroupCircles } from '../utils'
import { stringify } from '../utils/querystring'
import Loading from './Loading'

@block
class Circles extends React.Component {
  componentDidMount() {
    this.props.sync()
  }

  render(b) {
    const { error, labels, loading, results } = this.props
    const circles = sortGroupCircles(results)

    return (
      <section className={b}>
        <Helmet>
          <title>Gibolt - Circles</title>
        </Helmet>
        {error && (
          <article className={b.e('group').m({ error: true })}>
            <h2>Error during issue fetch</h2>
            <code>{error}</code>
          </article>
        )}
        {loading && <Loading />}
        <article className={b.e('circles')}>
          <h2>Circles</h2>
          {circles.length > 0 ? (
            <ul>
              {circles.map(circle => (
                <li
                  key={circle.circle_id}
                  className={b.e('item')}
                  style={{
                    color: `${labels
                      .filter(label => label.label_id === circle.label_id)
                      .map(label => label.color)
                      .toString()}`,
                  }}
                >
                  <Link
                    className={b.e('link')}
                    to={{
                      pathname: '/circle',
                      search: stringify({ circle_id: circle.circle_id }),
                    }}
                  >
                    <span className={b.e('unlink')}>
                      {circle.parent_circle_name ? ' > ' : ''}
                    </span>
                    {circle.circle_name}
                    <span className={b.e('unlink')}>
                      {circle.parent_circle_name
                        ? ` (sous-cercle de "${circle.parent_circle_name}")`
                        : ''}
                      {circle.is_active ? '' : ' [disabled]'}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <span>No circles defined</span>
          )}
          <Link
            to={{
              pathname: '/createCircle',
            }}
          >
            <button type="submit">Add a circle</button>
          </Link>
        </article>
      </section>
    )
  }
}
export default connect(
  state => ({
    error: state.circles.errors,
    labels: state.labels.results.circle,
    loading: state.circles.loading,
    results: state.circles.results,
  }),
  dispatch => ({
    onSubmit: e => {
      const formCircle = [].slice
        .call(e.target.elements)
        .reduce(function(map, obj) {
          if (obj.name && obj.value) {
            map[obj.name] = obj.value
          }

          return map
        }, {})
      dispatch(createCircle(formCircle))
    },
    sync: () => {
      dispatch(setLoading('labels'))
      dispatch(fetchResults('labels'))
      dispatch(setLoading('circles'))
      dispatch(fetchResults('circles'))
    },
  })
)(Circles)
