import React, { Component } from 'react'
import { block } from '../utils'
import Issue from './Issue'
import './Issues.sass'


const b = block('Issues')
export default function Issues() {
  return (
    <section className={ b }>
      <h1 className={ b('head') }>
        1 issue grouped by Group
        <input type="checkbox" />
        <progress value="0.33" title="1/3">1/3</progress>
      </h1>
      <article>
        <h2>
          Group
          <input type="checkbox" />
        </h2>
        <ul>
          <Issue
            key="#42"
            id="#42"
            status="open"
            user="paradoxxxzero"
            avatar="https://avatars.githubusercontent.com/u/271144?v=3"
            href="https://github.com/Kozea/gibolt/issues/42"
            title="Ré-écrire gibolt"
            project="gibolt"
            labels={[{
                text: 'sprint',
                color: '#009800'
              },
              {
                text: 'bug',
                color: '#9a62d3'
              },
              {
                text: 'tool',
                color: '#882244'
              }
            ]} />
        </ul>
      </article>
    </section>
  )
}
