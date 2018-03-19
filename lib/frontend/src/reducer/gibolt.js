import initial from './initial'
import { handleResultsLoadingAndError } from './generic'

export const circle = (state = initial.circle, action) => {
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
    case 'REMOVE_CIRCLE_MILESTONE':
      return {
        results: {
          ...state.results,
          circle_milestones: action.circleMilestones,
        },
      }
    default:
      return handleResultsLoadingAndError(state, 'circle', action)
  }
}

export const circles = (state = initial.circles, action) =>
  handleResultsLoadingAndError(state, 'circles', action)

export const items = (state = initial.items, action) => {
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

export const meeting = (state = initial.meeting, action) => {
  switch (action.type) {
    case 'MEETING_ON_EDITION':
      return {
        ...state,
        isEditionDisabled: action.value,
      }
    case 'MEETING_EMPTY':
      return {
        ...state,
        results: {
          attendees: [],
          actions: [],
          indicators: [],
          projects: [],
          agenda: [],
          content: '',
        },
      }
    case 'MEETING_UPDATE':
      return {
        ...state,
        results: {
          ...state.results,
          [action.dataType]: action.data,
        },
      }
    case 'MEETING_PARTIAL_UPDATE':
      return {
        ...state,
        results: {
          ...state.results,
          report_id: action.data.report_id,
          circle_id: action.data.circle_id,
          created_at: action.data.created_at,
          author_id: action.data.author_id,
          modified_at: action.data.modified_at,
          modified_by: action.data.modified_by,
        },
      }
    case 'MEETING_UPDATE_ATTENDEES':
      return {
        ...state,
        results: {
          ...state.results,
          attendees: state.results.attendees.map(user => {
            if (user.user.user_name === action.name) {
              user.checked = action.checked
            }
            return user
          }),
        },
      }
    case 'MEETING_UPDATE_ACTIONS':
      return {
        ...state,
        results: {
          ...state.results,
          actions: state.results.actions.map(act => {
            if (act.content === action.content) {
              act.checked = action.checked
            }
            return act
          }),
        },
      }
    case 'MEETING_UPDATE_INDICATORS':
      return {
        ...state,
        results: {
          ...state.results,
          indicators: state.results.indicators.map(ind => {
            if (ind.content === action.content) {
              ind.value = action.value
            }
            return ind
          }),
        },
      }
    case 'MEETING_UPDATE_PROJECTS':
      return {
        ...state,
        results: {
          ...state.results,
          projects: state.results.projects.map(mil => {
            if (mil.id === action.milestoneId) {
              mil.comment = action.comment
            }
            return mil
          }),
        },
      }
    case 'MEETING_UPDATE_AGENDA':
      return {
        ...state,
        results: {
          ...state.results,
          agenda: state.results.agenda.map(iss => {
            if (iss.ticket_id === action.ticketId) {
              iss.meeting_comment = action.meetingComment
            }
            return iss
          }),
        },
      }
    case 'MEETING_UPDATE_CONTENT':
      return {
        ...state,
        results: {
          ...state.results,
          content: action.content,
        },
      }
    case 'MILESTONE_EXPAND':
      return {
        ...state,
        results: {
          ...state.results,
          projects: state.results.projects.map(milestone => {
            if (milestone.id === action.milestoneId) {
              return { ...milestone, is_expanded: !milestone.is_expanded }
            }
            return milestone
          }),
        },
      }
    case 'REMOVE_MEETING_MILESTONE':
      return {
        results: {
          ...state.results,
          projects: action.projects,
        },
      }
    case 'UPDATE_LAST_REPORT':
      return {
        ...state,
        lastReportDate: action.value,
      }
    default:
      return handleResultsLoadingAndError(state, 'meeting', action)
  }
}

export const meetings = (state = initial.meetings, action) =>
  handleResultsLoadingAndError(state, 'meetings', action)

export const meetingsTypes = (state = initial.meetingsTypes, action) =>
  handleResultsLoadingAndError(state, 'meetingsTypes', action)

export const role = (state = initial.role, action) => {
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

export const roleFocus = (state = initial.roleFocus, action) => {
  switch (action.type) {
    default:
      return handleResultsLoadingAndError(state, 'roleFocus', action)
  }
}

export const roles = (state = initial.roles, action) =>
  handleResultsLoadingAndError(state, 'roles', action)
