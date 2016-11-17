import React, { Component } from 'react'
import { connect } from 'react-redux'
import { push } from '../actions'
import { block, timelineRangeFromState } from '../utils'
import Loading from './Loading'
import './Timeline.sass'


const b = block('Timeline')
function Timeline({ range, query, loading, error, timeline, onDateChange }) {
  return (
    <section className={ b }>
      <h1 className={ b('head') }>
        Timeline from
        <input type="date" value={ range.start }
               onChange={ e => onDateChange(e.target.value, 'start', query)} />
         to
         <input type="date" value={ range.stop }
           onChange={ e => onDateChange(e.target.value, 'stop', query)} />.
      </h1>
      { loading && <Loading /> }
      { error && (
        <article className={ b('date', { error: true }) }>
          <h2>Error during issue fetch</h2>
          <code>{ error }</code>
        </article>
      )}
      { timeline.map(([date, lines]) =>
        <article key={ date } className={ b('date') }>
          <h2>{ date }</h2>
          <ul>
            { lines.map(line =>
              <li key={ line.id }>
                { line.title }
              </li>
            )}
          </ul>
        </article>
      )}
    </section>
  )
}
export default connect(state => ({
    query: state.router.query,
    timeline: state.timeline.list,
    loading: state.timeline.loading,
    error: state.timeline.error,
    range: timelineRangeFromState(state)
  }), dispatch => ({
    onDateChange: (date, type, query) => {
      dispatch(push({
        pathname: '/timeline',
        query: {
          ...query,
          [type]: date || undefined
        }
      }))
    }
  })
)(Timeline)
