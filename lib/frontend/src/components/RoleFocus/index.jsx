import './RoleFocus.sass'

import React from 'react'
import { Helmet } from 'react-helmet'
import { withRouter } from 'react-router-dom'

import { setLoading } from '../../actions'
import { fetchRoleFocus } from '../../actions/rolefocus'
import { block, connect } from '../../utils'
import Loading from './../Loading'

const b = block('RoleFocus')

class Role extends React.Component {
  componentDidMount() {
    this.props.sync()
  }

  render() {
    const { error, loading, roleFocus } = this.props
    return (
      <section className={b()}>
        <Helmet>
          <title>Gibolt - Role Focus</title>
        </Helmet>
        <article className={b('roleFocus')}>
          {loading && <Loading />}
          {error && (
            <article className={b('date', { error: true })}>
              <h2>Error during issue fetch</h2>
              <code>{error}</code>
            </article>
          )}
          <h1>{roleFocus.focus_name}</h1>
        </article>
      </section>
    )
  }
}

export default withRouter(
  connect(
    state => ({
      error: state.roleFocus.error,
      loading: state.roleFocus.loading,
      roleFocus: state.roleFocus.results,
    }),
    dispatch => ({
      sync: () => {
        dispatch(setLoading('roleFocus'))
        dispatch(fetchRoleFocus())
      },
    })
  )(Role)
)
