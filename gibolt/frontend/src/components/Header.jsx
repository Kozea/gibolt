import React, { Component } from 'react'
import { block } from '../utils'
import HeaderItem from '../components/HeaderItem'
import './Header.sass'


const b = block('Header')
export default function Header() {
  return (
    <header className={ b }>
      <h1 className={ b('title') }>Gibolt</h1>
      <nav>
        <ul className={ b('nav') }>
          <HeaderItem action="my_sprint" active={true}>
            My Sprint
          </HeaderItem>
          <HeaderItem action="my_tickets">
            My Tickets
          </HeaderItem>
          <HeaderItem action="show_now">
            Timeline
          </HeaderItem>
          <HeaderItem action="show_sprint_issues">
            Issues
          </HeaderItem>
          <HeaderItem action="show_assigned_issues">
            Report
          </HeaderItem>
          <HeaderItem action="repositories">
            Repositories
          </HeaderItem>
        </ul>
      </nav>
    </header>
  )
}
