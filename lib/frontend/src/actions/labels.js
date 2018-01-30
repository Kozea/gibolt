import { setError, setResults } from './index'

export const enableLabelEdition = labelId => ({
  type: 'ENABLE_LABEL_EDITION',
  labelId,
})

export const disableLabelEdition = labelId => ({
  type: 'DISABLE_LABEL_EDITION',
  labelId,
})

export const setErrorLabels = error => ({
  type: 'SET_ERROR_LABELS',
  error,
})

export const updateSelectedLabelType = labelTypeId => ({
  type: 'UPDATE_LABEL_TYPE',
  labelTypeId,
})

export const isPriorityValueUnique = (
  labelTypeId,
  newPriorityValue,
  labels
) => {
  const filteredLabels = labels.filter(
    label =>
      (label.type_id =
        labelTypeId &&
        label.priorities.filter(priority => priority.value === newPriorityValue)
          .length > 0)
  )
  return !filteredLabels.length > 0
}

export const checkPriorityUniqueness = (event, labelTypeId, labels) => {
  if (isPriorityValueUnique(labelTypeId, +event.target.value, labels)) {
    event.target.setCustomValidity('')
  } else {
    event.target.setCustomValidity('The priority value must be unique')
  }
}

export const fetchLabels = () => async dispatch => {
  let response
  let json = {}
  const targets = ['label_types', 'labels', 'priorities']
  const results = { label_types: [], labels: [], priorities: [] }

  for (let i = 0; i < targets.length; i++) {
    try {
      response = await fetch(`/api/${targets[i]}`, {
        method: 'GET',
        credentials: 'same-origin',
      })
    } catch (e) {
      return dispatch(
        setError(
          `Erreur pendant la récupération des ${targets[i]}`,
          'adminLabels'
        )
      )
    }
    if (response.status >= 200 && response.status < 300) {
      try {
        json = await response.json()
        results[targets[i]] = json.objects
      } catch (e) {
        return dispatch(
          setError('La réponse ne contient pas de json', 'adminLabels')
        )
      }
    } else {
      const jsonMessage = typeof json === 'undefined' ? '' : json.message
      return dispatch(
        setError(
          `${response.status}: ${response.statusText} ${jsonMessage}`,
          'adminLabels'
        )
      )
    }
  }
  dispatch(setResults(results, 'adminLabels'))
}

export const addOrEditLabelAndPriority = (
  label,
  priorityData,
  actionType
) => async dispatch => {
  let response, labelJson, apiLabelUrl, apiPriorityUrl, method

  switch (actionType) {
    case 'creation':
      apiLabelUrl = 'api/labels'
      apiPriorityUrl = 'api/priorities'
      method = 'POST'
      break
    case 'edition':
      apiLabelUrl = `api/labels/${label.label_id}`
      if (priorityData !== null) {
        apiPriorityUrl = `api/priorities/${priorityData.priority_id}`
      }
      method = 'PATCH'
      break
    default:
      return dispatch(
        setError(
          `Erreur, l'action "${actionType}" n'est pas supportée`,
          'adminLabels'
        )
      )
  }

  try {
    response = await fetch(apiLabelUrl, {
      method: method,
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(label),
    })
  } catch (e) {
    return dispatch(
      setErrorLabels('Erreur pendant la création/édition du label')
    )
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      labelJson = await response.json()
    } catch (e) {
      return dispatch(
        setError('La réponse ne contient pas de json (label)', 'adminLabels')
      )
    }
  } else {
    console.error(response)
    return dispatch(
      setErrorLabels(`Erreur [${response.status}] ${response.statusText}`)
    )
  }
  if (priorityData !== null) {
    let priority = {}
    if (actionType === 'creation') {
      priority = {
        label_id: labelJson.objects[0].label_id,
        value: priorityData,
      }
    } else {
      priority = priorityData
    }
    try {
      response = await fetch(apiPriorityUrl, {
        method: method,
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(priority),
      })
    } catch (e) {
      return dispatch(
        setErrorLabels('Erreur pendant la création/édition de la priorité')
      )
    }
    if (response.status >= 200 && response.status < 300) {
      try {
        await response.json()
      } catch (e) {
        return dispatch(
          setError(
            'La réponse ne contient pas de json (priorité)',
            'adminLabels'
          )
        )
      }
    } else {
      return dispatch(
        setErrorLabels(`Erreur [${response.status}] ${response.statusText}`)
      )
    }
  }
  dispatch(fetchLabels())
}

export const deleteLabel = labelId => async dispatch => {
  let response
  try {
    response = await fetch(`api/labels/${labelId}`, {
      method: 'DELETE',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (e) {
    return dispatch(
      setErrorLabels(`Erreur pendant la suppression du label "${labelId}"`)
    )
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      await response.json()
      dispatch(fetchLabels())
    } catch (e) {
      console.error(e)
      return dispatch(setErrorLabels('La réponse ne contient pas de json'))
    }
  } else {
    return dispatch(
      setErrorLabels(`Erreur [${response.status}] ${response.statusText}`)
    )
  }
}

export const labelSubmit = (
  event,
  selectedLabelTypeId,
  actionType,
  label = null
) => dispatch => {
  const newLabel = {
    label_type_id: selectedLabelTypeId,
    label_name: event.target.labelName.value,
    label_color: event.target.labelColor.value,
  }
  if (actionType === 'edition') {
    newLabel.label_id = label.label_id
  }
  const priorityData = event.target.labelPriority
    ? actionType === 'edition'
      ? {
          priority_id: label.priorities[0].priority_id,
          value: +event.target.labelPriority.value,
        }
      : +event.target.labelPriority.value
    : null
  dispatch(addOrEditLabelAndPriority(newLabel, priorityData, actionType))
}
