const emptyResults = {
  results: {},
  loading: false,
  mustLoad: true,
  error: null,
}

export default {
  labels: {
    ...emptyResults,
    results: {
      priority: [{ text: 'Urgent', color: '#e73c7d' }],
      ack: [],
      qualifier: [],
    },
  },
  search: '',
  issues: {
    ...emptyResults,
    results: {
      issues: [],
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
  },
  repository: {
    ...emptyResults,
    results: {
      labels: [],
      missingLabels: [],
      overlyLabels: [],
      repository: { permissions: { push: false } },
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
  },
  issueForm: {
    ...emptyResults,
    results: {
      rolesSelect: [],
      milestonesSelect: [],
      error: null,
    },
  },
  modifiers: { ctrl: false, shift: false, alt: false },
}
