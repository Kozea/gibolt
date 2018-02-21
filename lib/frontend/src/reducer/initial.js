const emptyResults = {
  results: {},
  loading: false,
  mustLoad: true,
  error: null,
}

export default {
  circle: {
    ...emptyResults,
    results: {
      circle: {},
    },
    is_in_edition: false,
  },
  circleMilestones: {
    ...emptyResults,
    results: [],
  },
  circles: {
    ...emptyResults,
    results: [],
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
  issues: {
    ...emptyResults,
    results: {
      issues: [],
      agenda: [],
      currentIssue: {},
    },
  },
  items: {
    ...emptyResults,
    results: [],
    form_checklist: false,
    form_indicator: false,
  },
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
  markvalue: '',
  meeting: {
    ...emptyResults,
    results: {},
    is_in_edition: false,
  },
  meetings: {
    ...emptyResults,
    results: [],
  },
  meetingsTypes: {
    ...emptyResults,
    results: [],
  },
  modal: {
    creation: false,
    display: false,
    issueId: null,
  },
  modifiers: { ctrl: false, shift: false, alt: false },
  params: {},
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
  role: {
    ...emptyResults,
    results: {
      role: {},
    },
    is_in_edition: false,
  },
  roles: {
    ...emptyResults,
    results: [],
  },
  search: '',
  timeline: {
    ...emptyResults,
    results: {
      milestones: [],
    },
  },
  user: '',
  users: {
    ...emptyResults,
    results: [],
  },
}
