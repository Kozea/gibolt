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
    circle: strToList(query.circle) || [],
  }
}

export const allLabelsFromState = state => {
  const labels = labelsFromState(state)
  return labels.priority.concat(
    labels.ack.concat(labels.qualifier.concat(labels.circle))
  )
}

export const timelineRangeFromState = state => {
  const query = parse(state.router.location.search)
  const monthStart = subMonths(startOfMonth(Date.now()), 1)
  return {
    start: query.start || format(monthStart, 'YYYY-MM-DD'),
    stop: query.stop || format(addYears(monthStart, 1), 'YYYY-MM-DD'),
    withoutDueDate: query.withoutDueDate || false,
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

export const circleNameFromState = state => ({
  circle_id: parse(state.router.location.search).circle_id,
})
export const roleNameFromState = state => ({
  role_id: parse(state.router.location.search).role_id,
})

export const reportIdFromState = state => ({
  report_id: parse(state.router.location.search).report_id,
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
        label => !issue.labels.find(labelObj => label === labelObj.label_name)
      ).length === 0 &&
      negativeLabels.filter(label =>
        issue.labels.find(labelObj => label === labelObj.label_name)
      ).length === 0
  )
}

const getProject = issue => issue.repo_name

const getIds = {
  nogroup: () => ['OVERALL'],
  state: i => [i.state],
  milestone: i => [
    i.milestone_id ? `${i.milestone_id}|${i.milestone_number}` : i.repo_name,
  ],
  project: i => [i.repo_name],
  assignee: i =>
    i.assignees.length > 0 ? i.assignees.map(a => a.user_id) : ['UNASSIGNED'],
}

const getLabels = {
  nogroup: () => 'Overall',
  state: i => i.state.replace(/\b\w/g, l => l.toUpperCase()),
  milestone: i =>
    (i.milestone_id && `${getProject(i)} ⦔ ${i.milestone_title}`) ||
    `${getProject(i)} ⦔ No milestone`,
  project: getProject,
  assignee: (i, id) =>
    i.assignees.length > 0
      ? i.assignees.filter(a => a.user_id === id)[0].user_name
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

export const sortIssues = issues =>
  issues.sort((a, b) => a.ticket_id - b.ticket_id)

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

export const getMissingAndOverlyLabels = state => {
  const confLabels = state.labels.results.priority.concat(
    state.labels.results.ack,
    state.labels.results.qualifier
  )
  const missingLabels = confLabels.filter(
    confLabel =>
      state.repository.results.labels
        .map(resultLabel => resultLabel.label_name)
        .indexOf(confLabel.text) === -1
  )
  const overlyLabels = state.repository.results.labels.filter(
    resultLabel =>
      confLabels.map(label => label.text).indexOf(resultLabel.label_name) === -1
  )
  return { missingLabels: missingLabels, overlyLabels: overlyLabels }
}

export const querystringize = object => {
  var query = []
  for (const key in object) {
    if (object.hasOwnProperty(key)) {
      if (Object.prototype.toString.call(object[key]) === '[object Array]') {
        query = querystringizeArray(query, object[key], key)
      } else {
        query.push(
          `${encodeURIComponent(key)}=${encodeURIComponent(object[key])}`
        )
      }
    }
  }
  return query.join('&')
}

const querystringizeArray = (query, object, key) => {
  for (const value in object) {
    if (object.hasOwnProperty(value)) {
      query.push(
        `${encodeURIComponent(key)}=${encodeURIComponent(object[value])}`
      )
    }
  }
  return query
}

const getCircleChildren = (parentCircle, circles) => {
  const children = []
  circles.find(circle => {
    if (circle.parent_circle_id === parentCircle.circle_id) {
      circle.parent_circle_name = parentCircle.circle_name
      children.push(circle)
    }
  })
  return children
}

export const sortGroupCircles = circles => {
  let sortedCircles = []
  circles.sort((a, b) => b.parent_circle_id - a.parent_circle_id)
  for (const index in circles) {
    // only 2 levels, no need for a recursive function for now
    if (circles[index].parent_circle_id === null) {
      sortedCircles.push(circles[index])
      const children = getCircleChildren(circles[index], circles)
      sortedCircles = sortedCircles.concat(children)
    }
  }
  return sortedCircles
}

export const sortRepos = repositories => {
  repositories.sort(function(a, b) {
    return a.repo_name.toLowerCase() > b.repo_name.toLowerCase()
      ? 1
      : b.repo_name.toLowerCase() > a.repo_name.toLowerCase() ? -1 : 0
  })
  return repositories
}

export const sortMilestones = milestones => {
  milestones.sort(function(a, b) {
    return a.due_on > b.due_on ? 1 : b.due_on > a.due_on ? -1 : 0
  })
  return milestones
}

export const sortRoles = roles => {
  roles.sort(function(a, b) {
    return a.role_name.toLowerCase() > b.role_name.toLowerCase()
      ? 1
      : b.role_name.toLowerCase() > a.role_name.toLowerCase() ? -1 : 0
  })
  return roles
}

export const sortUsers = users => {
  users.sort(function(a, b) {
    return a.user_name.toLowerCase() > b.user_name.toLowerCase()
      ? 1
      : b.user_name.toLowerCase() > a.user_name.toLowerCase() ? -1 : 0
  })
  return users
}

export const getColor = (label, circleName) => {
  if (circleName.toLowerCase() === label.text.toLowerCase()) {
    return label
  }
}
