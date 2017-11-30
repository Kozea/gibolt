import bemblock from 'bem-cn'
import { addYears, format, startOfMonth, subMonths } from 'date-fns'
import { parse } from 'query-string'
import { connect as connectWithoutLocation } from 'react-redux'
import { StaticRouter, withRouter } from 'react-router-dom'
import { routerMiddleware } from 'react-router-redux'
import { applyMiddleware, compose, createStore } from 'redux'
import thunk from 'redux-thunk'

import reducer from './reducer'

bemblock.setup({
  el: '__',
  mod: '--',
  modValue: '-',
})

export const block = blockName => {
  const b = bemblock(blockName)
  const element = (...args) => b(...args).toString()
  element.chain = b
  return element
}

export const issuesStateFromState = state =>
  parse(state.router.location.search).state || 'all'

export const grouperFromState = state =>
  parse(state.router.location.search).grouper || 'state'

export const strToList = strOrList =>
  (strOrList || strOrList === '') &&
  (strOrList.constructor === Array ? strOrList : [strOrList])

export const usersFromState = state => {
  const query = parse(state.router.location.search)
  return {
    assignee: strToList(query.assignee) || [state.user.login],
    involves: strToList(query.involves) || [''],
  }
}

export const labelsFromState = state => {
  const query = parse(state.router.location.search)
  return {
    priority: strToList(query.priority) || ['Urgent'],
    ack: strToList(query.ack) || [],
    qualifier: strToList(query.qualifier) || [],
  }
}

export const allLabelsFromState = state => {
  const labels = labelsFromState(state)
  return labels.priority.concat(labels.ack.concat(labels.qualifier))
}

export const timelineRangeFromState = state => {
  const query = parse(state.router.location.search)
  const monthStart = subMonths(startOfMonth(Date.now()), 1)
  return {
    start: query.start || format(monthStart, 'YYYY-MM-DD'),
    stop: query.stop || format(addYears(monthStart, 1), 'YYYY-MM-DD'),
  }
}

export const reportRangeFromState = state => {
  const query = parse(state.router.location.search)
  const monthStart = startOfMonth(Date.now())
  return {
    start: query.start || format(monthStart, 'YYYY-MM-DD'),
    stop: query.stop || format(addYears(monthStart, 1), 'YYYY-MM-DD'),
  }
}

export const repositoryNameFromState = state => ({
  name: parse(state.router.location.search).name,
})

export const filterIssuesOnState = (issues, state) => {
  const issuesState = issuesStateFromState(state)
  return issues.filter(
    issue => issuesState === 'all' || issuesState === issue.state
  )
}

export const filterIssuesOnLabels = (issues, state) => {
  const labels = allLabelsFromState(state).filter(x => x !== '')
  const positiveLabels = labels.filter(x => x[0] !== '-')
  const negativeLabels = labels.filter(x => x[0] === '-').map(x => x.slice(1))
  return issues.filter(
    issue =>
      positiveLabels.filter(
        label => !issue.labels.find(({ name }) => label === name)
      ).length === 0 &&
      negativeLabels.filter(label =>
        issue.labels.find(({ name }) => label === name)
      ).length === 0
  )
}

const getProject = issue => issue.repository_url.split('/').slice(-1)[0]

const getIds = {
  nogroup: () => ['OVERALL'],
  state: i => [i.state],
  milestone: i => [(i.milestone && i.milestone.id) || i.repository_url],
  project: i => [i.repository_url],
  assignee: i =>
    i.assignees.length > 0 ? i.assignees.map(a => a.id) : ['UNASSIGNED'],
}

const getLabels = {
  nogroup: () => 'Overall',
  state: i => i.state.replace(/\b\w/g, l => l.toUpperCase()),
  milestone: i =>
    (i.milestone && `${getProject(i)} ⦔ ${i.milestone.title}`) ||
    `${getProject(i)} ⦔ No milestone`,
  project: getProject,
  assignee: (i, id) =>
    i.assignees.length > 0
      ? i.assignees.filter(a => a.id === id)[0].login
      : 'Unassigned',
}

export const values = mapping =>
  Object.keys(mapping).map(key => ({ ...mapping[key], id: key }))

export const groupIssues = (issues, grouper) =>
  values(
    issues.reduce((groups, issue) => {
      const getId = getIds[grouper],
        getLabel = getLabels[grouper],
        ids = getId(issue)
      ids.map(id => {
        if (groups[id] === void 0) {
          groups[id] = {
            group: getLabel(issue, id),
            issues: [],
          }
        }
        groups[id].issues.push(issue)
      })
      return groups
    }, {})
  )

export const sortIssues = issues => issues.sort((a, b) => a.id - b.id)

export const sortGroupIssues = (issues, grouper) => {
  if (grouper === 'state') {
    return issues.sort(a => (a.group === 'open' && 1) || -1)
  }
  return issues.sort((a, b) => {
    if (a.group.toLowerCase() < b.group.toLowerCase()) {
      return -1
    }
    if (a.group.toLowerCase() > b.group.toLowerCase()) {
      return 1
    }
    return 0
  })
}

export const staticStoreAndHistory = (location, state = void 0) => {
  // This is a hack to get the static history for react-router-redux
  // This might get simpler:
  // https://github.com/supasate/react-router-redux/issues/39
  const staticRouter = new StaticRouter()
  staticRouter.props = { location, context: {}, basename: '' }
  const { props: { history: staticHistory } } = staticRouter.render()

  const store = createStore(
    reducer,
    state,
    compose(applyMiddleware(routerMiddleware(staticHistory), thunk))
  )
  return { store, history: staticHistory }
}

/* Explanation: https://github.com/ReactTraining/react-router\
/blob/master/packages/react-router/docs/guides/redux.md
*/
export const connect = (...connectArgs) => (Component, ...componentArgs) => {
  const wrapped = withRouter(
    connectWithoutLocation(...connectArgs)(Component, ...componentArgs)
  )
  // For testing components and not containers
  wrapped.Component = Component
  return wrapped
}
