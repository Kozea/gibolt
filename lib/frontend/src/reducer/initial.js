const emptyResults = {
  results: {},
  loading: false,
  mustLoad: true,
  error: null,
}

export default {
  circle: {
    ...emptyResults,
    results: {},
    is_in_edition: false,
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
  meeting: {
    ...emptyResults,
    results: {
      attendees: [],
      actions: [],
      indicators: [],
      projects: [],
      agenda: [],
      content: '',
      is_submitted: false,
    },
    isEditionDisabled: true,
    lastReportDate: null,
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
    data: {},
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
  roleFocus: {
    ...emptyResults,
    results: {
      roleFocus: {},
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
