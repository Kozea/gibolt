const emptyResults = {
  results: {},
  loading: false,
  mustLoad: true,
  error: null,
}

export default {
  markvalue: '',
  labels: {
    ...emptyResults,
    results: {
      priority: [{ text: 'Urgent', color: '#e73c7d', priority: 0 }],
      ack: [],
      qualifier: [],
      circle: [],
    },
    selectedLabelType: 'ack',
    selectedLabel: '',
  },
  search: '',
  issues: {
    ...emptyResults,
    results: {
      issues: [],
      agenda: [],
      currentIssue: {},
    },
  },
  timeline: {
    ...emptyResults,
    results: {
      milestones: [],
    },
  },
  report: {
    ...emptyResults,
    results: {
      issues: [],
    },
  },
  repositories: {
    ...emptyResults,
    results: {
      repositories: [],
    },
    selectedRepositories: [],
  },
  repository: {
    ...emptyResults,
    results: {
      labels: [],
      missingLabels: [],
      overlyLabels: [],
      repository: {
        description: '',
        permissions: { push: false },
        repo_id: null,
        repo_name: '',
      },
      errors: null,
    },
  },
  users: {
    ...emptyResults,
    results: [],
  },
  user: '',
  circles: {
    ...emptyResults,
    results: [],
  },
  circle: {
    ...emptyResults,
    results: {
      circle: {},
    },
    is_in_edition: false,
  },
  roles: {
    ...emptyResults,
    results: [],
  },
  role: {
    ...emptyResults,
    results: {
      role: {},
    },
    is_in_edition: false,
  },
  issueForm: {
    ...emptyResults,
    results: {
      rolesSelect: [],
      milestonesSelect: [],
      title: '',
      project: '',
      circleId: '',
      error: null,
    },
  },
  items: {
    ...emptyResults,
    results: [],
    form_checklist: false,
    form_indicator: false,
  },
  meetingsTypes: {
    ...emptyResults,
    results: [],
  },
  meetings: {
    ...emptyResults,
    results: [],
  },
  meeting: {
    ...emptyResults,
    results: {},
    is_in_edition: false,
  },
  circleMilestones: {
    ...emptyResults,
    results: [],
  },
  modal: {
    creation: false,
    display: false,
    issueId: null,
  },
  params: {},
  modifiers: { ctrl: false, shift: false, alt: false },
}
