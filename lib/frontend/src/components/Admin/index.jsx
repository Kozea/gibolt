import './Admin.sass'

import React from 'react'
import { Helmet } from 'react-helmet'
import { Route, Switch } from 'react-router-dom'

import { block } from '../../utils'
import AdminLabels from './AdminLabels'
import AdminMenu from './AdminMenu'
import NotFound from './../NotFound'
import Repositories from './AdminRepositories'
import Repository from './AdminRepository'

const b = block('Admin')

export default function Admin() {
  return (
    <section className={b()}>
      <Helmet>
        <title>Gibolt - Admin</title>
      </Helmet>
      <Switch>
        <Route exact path="/admin" component={AdminMenu} />
        <Route path="/admin/labels" component={AdminLabels} />
        <Route path="/admin/repositories" component={Repositories} />
        <Route path="/admin/repository" component={Repository} />
        <Route component={NotFound} />
      </Switch>
    </section>
  )
}
