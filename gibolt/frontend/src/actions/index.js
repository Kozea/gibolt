import fetch from 'isomorphic-fetch'

let tid = null

export const incrementCounter = (step = 1) => {
  return {
    type: 'INCREMENT_COUNTER',
    step
  }
}

export const resetCounter = () => {
  return {
    type: 'RESET_COUNTER'
  }
}

export const setVersion = (version) => {
  return {
    type: 'SET_VERSION',
    version
  }
}

export const log = (message) => {
  return {
    type: 'LOG',
    message: {
      id: (new Date()).getTime(),  // This is bad
      text: message
    }
  }
}

export const deleteLog = (messageId) => {
  return {
    type: 'DELETE_LOG',
    messageId
  }
}

// Thunks
export const startCounter = () => {
  return (dispatch, getState) => {
    const { count } = getState()
    tid = setInterval(() => {
      dispatch(incrementCounter(count.step))
      dispatch(log(`Incremented to ${getState().count.val}`))
    }, 1000)
  }
}

export const stopCounter = () => {
  return () => {
    tid && clearInterval(tid)
    tid = null
  }
}

export const getVersion = () => {
  return (dispatch) => {
    fetch('/version.json')
    .then(response => response.json())
    .then(json =>
      dispatch(setVersion(json.version)))
  }
}
