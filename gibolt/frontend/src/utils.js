import block from 'bem-cn'


block.setup({
  el: '__',
  mod: '--',
  modValue: '-'
})

export const issuesStateFromState = (state) => (
  state.router.query['state'] || 'open'
)

export const filterIssues = (issues, state) => {
  const issuesState = issuesStateFromState(state)
  return issues.filter((issue) => {
    return (
      issuesState == 'all' || issuesState == issue.state
    )
  })
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

export const groupIssues = (issues, grouper) => {
  let grouped = issues.reduce((groups, issue) => {
    let getId = getIds[grouper],
        getLabel = getLabels[grouper],
        ids = getId(issue)
    ids.map((id) => {
      if (groups[id] == undefined) {
        groups[id] = {
          id,
          group: getLabel(issue, id),
          issues: []
        }
      }
      groups[id].issues.push(issue)
    })
    return groups
  }, {})
  return Object.keys(grouped).map((key) => grouped[key])
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
