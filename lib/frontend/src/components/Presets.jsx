import './Presets.sass'

import React from 'react'

import { block, connect } from '../utils'
import Preset from './Preset'

const b = block('Presets')
function Presets({ location }) {
  return (
    <header className={b()}>
      <h1 className={b('title')}>
        <a href="" className={b('ttl')}>
          Gibolt
        </a>
      </h1>
      <nav>
        <ul className={b('nav')}>
          <Preset action={{ pathname: '/' }} active={location.pathname === '/'}>
            Tickets
          </Preset>
          <Preset action="/timeline" active={location.pathname === '/timeline'}>
            Timeline
          </Preset>
          <Preset action="/report" active={location.pathname === '/report'}>
            Report
          </Preset>
          <Preset action="/circles" active={location.pathname === '/circles'}>
            Circles
          </Preset>
          <Preset action="/admin" active={location.pathname === '/admin'}>
            Admin
          </Preset>
        </ul>
      </nav>
    </header>
  )
}

export default connect(state => ({
  user: state.user,
}))(Presets)
