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
    labels: state.selected,
    search: state.search
  }
}

const fetchIssues = (dispatch) => {
  let state = store.getState()
  fetch('/issues.json', {
    method: 'POST',
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

export const selectLabel = (label_type, label) => {
  return (dispatch) => {
    dispatch(_selectLabel(label_type, label))
    fetchIssues(dispatch)
  }
}

export const selectOnlyLabel = (label_type, label) => {
  return (dispatch) => {
    dispatch(_selectOnlyLabel(label_type, label))
    fetchIssues(dispatch)
  }
}

export const search = (search_) => {
  return (dispatch) => {
    dispatch(_search(search_))
    fetchIssues(dispatch)
  }
}

export const setPreset = (preset) => {
  return (dispatch) => {
    dispatch(_setPreset(preset))
    fetchIssues(dispatch)
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
