import { routerReducer } from 'react-router-redux'
import { combineReducers } from 'redux'
import { httpStatusReducer } from 'redux-http-status'

import initial from './initial'
import {
  handleResultsLoadingAndError,
  modal,
  modifiers,
  params,
  search,
} from './generic'

const issues = (state = initial.issues, action) => {
  switch (action.type) {
    case 'TOGGLE_ISSUE':
      return {
        ...state,
        results: {
          ...state.results,
          issues: state.results.issues.map(issue => {
            if (issue.ticket_id === action.issueId) {
              return { ...issue, selected: !issue.selected }
            }
            return issue
          }),
        },
      }
    case 'UPDATE_CURRENT_ISSUE':
      return {
        ...state,
        results: {
          ...state.results,
          currentIssue: action.newIssue,
        },
      }
    case 'CHANGE_ISSUE':
      return {
        ...state,
        results: {
          ...state.results,
          issues: state.results.issues.map(issue => {
            if (action.issueId === issue.ticket_id) {
              return action.newIssue
            }
            return issue
          }),
          currentIssue: action.newIssue,
        },
      }
    case 'SET_ISSUES_SELECTNESS':
      return {
        ...state,
        results: {
          ...state.results,
          issues: state.results.issues.map(issue => {
            if (action.issuesId.indexOf(issue.ticket_id) > -1) {
              return { ...issue, selected: action.isSelected }
            }
            return issue
          }),
        },
      }
    case 'TOGGLE_EXPANDED':
      return {
        ...state,
        results: {
          ...state.results,
          issues: state.results.issues.map(issue => {
            if (issue.ticket_id === action.issueId) {
              return { ...issue, expanded: !issue.expanded }
            }
            return issue
          }),
        },
      }
    case 'TOGGLE_COMMENTS_EXPANDED':
      return {
        ...state,
        results: {
          ...state.results,
          issues: state.results.issues.map(issue => {
            if (issue.ticket_id === action.issueId) {
              return {
                ...issue,
                comments_expanded: !issue.comments_expanded,
                comments: action.comments,
              }
            }
            return issue
          }),
          currentIssue: {
            ...state.results.currentIssue,
            comments_expanded: !state.results.currentIssue.comments_expanded,
            comments: action.comments,
          },
        },
      }
    case 'SET_ERROR_ISSUE':
      return {
        results: {
          ...state.results,
        },
        error: action.errors,
      }
    default:
      return handleResultsLoadingAndError(state, 'issues', action)
  }
}

const labels = (state = initial.labels, action) => {
  switch (action.type) {
    case 'ENABLE_LABEL_EDITION':
      return {
        ...state,
        results: {
          ...state.results,
          [action.selectedLabelType]: [
            ...state.results[action.selectedLabelType],
          ].map(
            label =>
              label.label_id === action.labelId
                ? { ...label, isLabelInEdition: true }
                : { ...label }
          ),
        },
      }
    case 'DISABLE_LABEL_EDITION':
      return {
        ...state,
        results: {
          ...state.results,
          [action.selectedLabelType]: [
            ...state.results[action.selectedLabelType],
          ].map(
            label =>
              label.label_id === action.labelId
                ? { ...label, isLabelInEdition: false }
                : { ...label }
          ),
        },
      }
    case 'SET_ERROR_LABELS':
      return {
        ...state,
        error: action.error,
      }
    case 'UPDATE_LABEL':
      return {
        ...state,
        selectedLabel: action.label,
      }
    case 'UPDATE_LABEL_TYPE':
      return {
        ...state,
        selectedLabelType: action.labelType,
      }
    default:
      return handleResultsLoadingAndError(state, 'labels', action)
  }
}

const items = (state = initial.items, action) => {
  switch (action.type) {
    case 'CHECKLIST_ITEM':
      return {
        ...state,
        form_checklist: !state.form_checklist,
      }
    case 'INDICATOR_ITEM':
      return {
        ...state,
        form_indicator: !state.form_indicator,
      }
    case 'EDIT_ITEM':
      return {
        ...state,
        results: [...state.results].map(
          item =>
            item.item_id === action.itemId
              ? { ...item, editItem: true }
              : { ...item }
        ),
      }
    case 'CANCEL_ITEM':
      return {
        ...state,
        results: [...state.results].map(
          item =>
            item.item_id === action.itemId
              ? { ...item, editItem: false }
              : { ...item }
        ),
      }
    default:
      return handleResultsLoadingAndError(state, 'items', action)
  }
}

const users = (state = initial.users, action) =>
  handleResultsLoadingAndError(state, 'users', action)

const timeline = (state = initial.timeline, action) => {
  switch (action.type) {
    case 'MILESTONE_EDITION_STATUS_UPDATE':
      return {
        ...state,
        results: {
          milestones: state.results.milestones.map(milestone => {
            if (milestone.id === action.milestoneId) {
              return { ...milestone, is_in_edition: !milestone.is_in_edition }
            }
            return milestone
          }),
        },
      }
    default:
      return handleResultsLoadingAndError(state, 'timeline', action)
  }
}

const report = (state = initial.report, action) =>
  handleResultsLoadingAndError(state, 'report', action)

const repositories = (state = initial.repositories, action) => {
  switch (action.type) {
    case 'EMPTY_SELECTED_REPO':
      return {
        ...state,
        selectedRepositories: [],
      }
    case 'UPDATE_SELECTED_REPO':
      return {
        ...state,
        selectedRepositories: action.selectedRepositories,
      }
    default:
      return handleResultsLoadingAndError(state, 'repositories', action)
  }
}

const repository = (state = initial.repository, action) => {
  switch (action.type) {
    case 'DELETE_LABELS':
      return {
        ...state,
        results: {
          ...state.results,
          labels: state.results.labels.filter(
            label => action.deleted.label_id !== label.label_id
          ),
        },
      }
    case 'CREATE_LABELS':
      return {
        results: {
          ...state.results,
          labels: state.results.labels.concat(action.created),
        },
      }
    case 'CHANGE_REPOSITORY':
      return {
        results: {
          ...state.results,
          repository: action.newRepository,
          labels: action.newLabels,
        },
      }
    case 'SET_ERROR_REPO':
      return {
        results: {
          ...state.results,
          errors: action.errors,
        },
      }
    case 'UPDATE_LABELS':
      return {
        results: {
          ...state.results,
          missingLabels: action.missingAndOverlyLabels.missingLabels,
          overlyLabels: action.missingAndOverlyLabels.overlyLabels,
        },
      }
    default:
      return handleResultsLoadingAndError(state, 'repository', action)
  }
}

const user = (state = initial.user, action) => {
  switch (action.type) {
    case 'SET_USER':
      return action.user
    default:
      return state
  }
}

const circles = (state = initial.circles, action) =>
  handleResultsLoadingAndError(state, 'circles', action)

const role = (state = initial.role, action) => {
  switch (action.type) {
    case 'EDIT_ROLE':
      return {
        results: {
          ...state.results,
          is_in_edition: !state.results.is_in_edition,
        },
      }
    default:
      return handleResultsLoadingAndError(state, 'role', action)
  }
}

const circle = (state = initial.circle, action) => {
  switch (action.type) {
    case 'EDIT_CIRCLE':
      return {
        ...state,
        is_in_edition: !state.is_in_edition,
      }
    case 'TOGGLE_CIRCLE_ACCOUNT':
      return {
        results: {
          ...state.results,
          accountabilities_expanded: !action.accountExpanded,
        },
      }
    case 'TOGGLE_CIRCLE_DOMAIN':
      return {
        results: {
          ...state.results,
          domain_expanded: !action.domainExpanded,
        },
      }
    case 'TOGGLE_CIRCLE_PURPOSE':
      return {
        results: {
          ...state.results,
          purpose_expanded: !action.purposeExpanded,
        },
      }
    default:
      return handleResultsLoadingAndError(state, 'circle', action)
  }
}

const roles = (state = initial.roles, action) =>
  handleResultsLoadingAndError(state, 'roles', action)

const issueForm = (state = initial.issueForm, action) => {
  switch (action.type) {
    case 'UPDATE_ROLES_SELECT':
      return {
        results: {
          ...state.results,
          rolesSelect: action.rolesSelect,
        },
      }
    case 'UPDATE_MILESTONES_SELECT':
      return {
        results: {
          ...state.results,
          milestonesSelect: action.milestonesSelect,
        },
      }
    case 'UPDATE_CIRCLE_ID':
      return {
        results: {
          ...state.results,
          circleId: action.circleId,
        },
      }
    case 'UPDATE_PROJET':
      return {
        results: {
          ...state.results,
          project: action.project,
        },
      }
    case 'UPDATE_TITLE':
      return {
        results: {
          ...state.results,
          title: action.title,
        },
      }
    case 'EMPTY_FORM':
      return initial.issueForm
    default:
      return handleResultsLoadingAndError(state, 'issueForm', action)
  }
}

const markvalue = (state = initial.markvalue, action) => {
  switch (action.type) {
    case 'UPDATE_MARKDOWN':
      return action.content ? action.content : ''
    case 'DEL_MARKDOWN':
      return ''
    default:
      return state
  }
}

const meetings = (state = initial.meetings, action) =>
  handleResultsLoadingAndError(state, 'meetings', action)

const meetingsTypes = (state = initial.meetingsTypes, action) =>
  handleResultsLoadingAndError(state, 'meetingsTypes', action)

const meeting = (state = initial.meeting, action) => {
  switch (action.type) {
    case 'MEETING_ON_EDITION':
      return {
        ...state,
        is_in_edition: !state.is_in_edition,
      }
    default:
      return handleResultsLoadingAndError(state, 'meeting', action)
  }
}

const circleMilestones = (state = initial.circleMilestones, action) => {
  switch (action.type) {
    case 'MILESTONE_EXPAND':
      return {
        ...state,
        results: state.results.map(milestone => {
          if (milestone.milestone_id === action.milestoneId) {
            return { ...milestone, is_expanded: !milestone.is_expanded }
          }
          return milestone
        }),
      }
    default:
      return handleResultsLoadingAndError(state, 'circleMilestones', action)
  }
}

export default combineReducers({
  circle,
  circleMilestones,
  circles,
  items,
  labels,
  search,
  issueForm,
  issues,
  markvalue,
  meeting,
  meetings,
  meetingsTypes,
  modal,
  modifiers,
  params,
  report,
  repositories,
  repository,
  role,
  roles,
  timeline,
  users,
  user,
  router: routerReducer,
  status: httpStatusReducer,
})
