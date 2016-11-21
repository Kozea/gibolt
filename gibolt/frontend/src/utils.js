import block from 'bem-cn'
import moment from 'moment'


block.setup({
  el: '__',
  mod: '--',
  modValue: '-'
})

export const issuesStateFromState = (state) => (
  state.router.query['state'] || 'all'
)

export const grouperFromState = (state) => (
  state.router.query['grouper'] || 'state'
)

export const strToList = (strOrList) => (
  (strOrList || strOrList == '') && (strOrList.constructor == Array  ? strOrList : [strOrList])
)

export const usersFromState = (state) => ({
  assignee: strToList(state.router.query['assignee'])  || [state.user],
  involves: strToList(state.router.query['involves']) || ['']
})


export const labelsFromState = (state) => ({
  priority: strToList(state.router.query['priority']) || ['sprint'],
  qualifier: strToList(state.router.query['qualifier']) || []
})

export const allLabelsFromState = (state) => {
  let labels = labelsFromState(state)
  return labels.priority.concat(labels.qualifier)
}

export const timelineRangeFromState = (state) => {
  let startOfMonth = moment().startOf('month')
  return {
    start: state.router.query['start'] || startOfMonth.format('YYYY-MM-DD'),
    stop: state.router.query['stop'] || startOfMonth.add(1, 'y').format('YYYY-MM-DD')
  }
}

export const reportRangeFromState = (state) => {
  let startOfMonth = moment().startOf('month')
  return {
    start: state.router.query['start'] || startOfMonth.format('YYYY-MM-DD'),
    stop: state.router.query['stop'] || startOfMonth.add(1, 'y').format('YYYY-MM-DD')
  }
}


export const filterIssuesOnState = (issues, state) => {
  const issuesState = issuesStateFromState(state)
  return issues.filter((issue) => issuesState == 'all' || issuesState == issue.state)
}

export const filterIssuesOnLabels = (issues, state) => {
  var labels = allLabelsFromState(state)
  let index = labels.indexOf('')
  if (index > -1) {
    labels.splice(index, 1)
  }
  return issues.filter((issue) =>
    (labels.filter(label => !issue.labels.find(({ name }) => label == name)).length == 0)
  )
}


const getProject = (issue) => {
  return issue.repository_url.split('/').slice(-1)[0]
}

const getIds = {
  nogroup: (i) => ['OVERALL'],
  state: (i) => [i.state],
  milestone: (i) => [(i.milestone && i.milestone.id) || i.repository_url],
  project: (i) => [i.repository_url],
  assignee: (i) => i.assignees && i.assignees.map((a) => a.id) || ['UNASSIGNED'],
}

const getLabels = {
  nogroup: (i) => 'Overall',
  state: (i) => i.state.replace(/\b\w/g, (l) => l.toUpperCase()),
  milestone: (i) => i.milestone && (`${
    getProject(i) } ⦔ ${ i.milestone.title }`) || `${
      getProject(i) } ⦔ No milestone`,
  project: getProject,
  assignee: (i, id) => i.assignees.filter((a) => a.id == id)[0].login
}

export const values = (mapping) => Object.keys(mapping).map((key) => (
  { ...mapping[key], id: key })
)

export const groupIssues = (issues, grouper) => {
  return values(issues.reduce((groups, issue) => {
    let getId = getIds[grouper],
        getLabel = getLabels[grouper],
        ids = getId(issue)
    ids.map((id) => {
      if (groups[id] == undefined) {
        groups[id] = {
          group: getLabel(issue, id),
          issues: []
        }
      }
      groups[id].issues.push(issue)
    })
    return groups
  }, {}))
}

export const sortIssues = (issues, grouper) => {
  return issues.sort((a, b) => a.id - b.id)
}

export const sortGroupIssues = (issues, grouper) => {
  if (grouper == 'state') {
    return issues.sort((a, b) => a.group == 'open' && 1 || -1)
  }
  return issues.sort((a, b) => {
    if(a.group.toLowerCase() < b.group.toLowerCase()) {
      return -1
    }
    if(a.group.toLowerCase() > b.group.toLowerCase()) {
      return 1
    }
    return 0
  })
}

export { block }
