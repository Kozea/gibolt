export default {
  labels: {},
  search: '',
  issues: {
    results: {
      issues: [],
    },
    loading: true,
    mustLoad: true,
    error: null,
  },
  timeline: {
    results: {
      milestones: [],
    },
    loading: true,
    mustLoad: true,
    error: null,
  },
  report: {
    results: {
      issues: [],
    },
    loading: true,
    mustLoad: true,
    error: null,
  },
  repositories: {
    results: {
      repositories: [],
    },
    loading: true,
    mustLoad: true,
    error: null,
  },
  repository: {
    results: {
      labels: [],
      overlyLabels: [],
      missingLabels: [],
      repository: { permissions: { push: false } },
    },
    loading: true,
    mustLoad: true,
    error: null,
  },
  modifiers: {
    ctrl: false,
    shift: false,
    alt: false,
  },
  users: [],
  user: null,
}
