import fetch from 'isomorphic-fetch'
import store from '..'


const _selectLabel = (label_type, label) => {
  return {
    type: 'SELECT_LABEL',
    label_type,
    label
  }
}

const _selectOnlyLabel = (label_type, label) => {
  return {
    type: 'SELECT_ONLY_LABEL',
    label_type,
    label
  }
}

const _search = (search) => {
  return {
    type: 'SEARCH',
    search
  }
}

const _setPreset = (preset) => {
  return {
    type: 'SET_PRESET',
    preset
  }
}

const stateToParams = (state) => {
  return {
    labels: state.labels.selected,
    search: state.search
  }
}

export const fetchIssues = (dispatch, state) => {
  fetch('/issues.json', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(stateToParams(state))
  })
  .then(response => response.json())
  .then(json => {
    let newState = store.getState()
    if (JSON.stringify(json.params) == JSON.stringify(stateToParams(newState))) {
      dispatch(setIssues(json.issues))
    } else {
      console.log('State is not coherent with fetch response', json.params, newState)
    }
  })
}

export const fetchIssuesAction = () => {
  return (dispatch, getState) => fetchIssues(dispatch, getState())
}


export const selectLabel = (label_type, label) => {
  return (dispatch, getState) => {
    dispatch(_selectLabel(label_type, label))
    fetchIssues(dispatch, getState())
  }
}

export const selectOnlyLabel = (label_type, label) => {
  return (dispatch, getState) => {
    dispatch(_selectOnlyLabel(label_type, label))
    fetchIssues(dispatch, getState())
  }
}

export const search = (search_) => {
  return (dispatch, getState) => {
    dispatch(_search(search_))
    fetchIssues(dispatch, getState())
  }
}

export const setPreset = (preset) => {
  return (dispatch, getState) => {
    dispatch(_setPreset(preset))
    fetchIssues(dispatch, getState())
  }
}


export const setIssuesState = (issuesState) => {
  return {
    type: 'SET_ISSUES_STATE',
    issuesState
  }
}

export const setGrouper = (grouper) => {
  return {
    type: 'SET_GROUPER',
    grouper
  }
}

export const setIssues = (issues) => {
  return {
    type: 'SET_ISSUES',
    issues
  }
}
