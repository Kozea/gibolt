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
  },
  issueForm: {
    ...emptyResults,
    results: {
      rolesSelect: [],
      milestonesSelect: [],
      params: {},
      title: '',
      project: '',
      error: null,
    },
  },
  meetingsTypes: {
    results: [
      { type_id: 0, type_name: 'Triage' },
      { type_id: 1, type_name: 'Gouvernance' },
      { type_id: 2, type_name: 'Stratégie' },
    ],
    params: {},
  },
  meetings: {
    ...emptyResults,
    results: [],
  },
  modifiers: { ctrl: false, shift: false, alt: false },
}
