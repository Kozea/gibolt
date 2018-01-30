import { fetchResults, setError } from './index'

export const enableLabelEdition = (selectedLabelType, labelId) => ({
  type: 'ENABLE_LABEL_EDITION',
  selectedLabelType,
  labelId,
})

export const disableLabelEdition = (selectedLabelType, labelId) => ({
  type: 'DISABLE_LABEL_EDITION',
  selectedLabelType,
  labelId,
})

export const setErrorLabels = error => ({
  type: 'SET_ERROR_LABELS',
  error,
})

export const updateSelectedLabel = label => ({
  type: 'UPDATE_LABEL',
  label,
})

export const updateSelectedLabelType = labelType => ({
  type: 'UPDATE_LABEL_TYPE',
  labelType,
})

export const isPriorityValueUnique = (newPriorityValue, priorityLabels) => {
  const filteredLabels = priorityLabels.filter(
    label => label.priority === newPriorityValue
  )
  return !filteredLabels.length > 0
}

export const checkPriorityUniqueness = (event, priorityLabels) => {
  if (isPriorityValueUnique(+event.target.value, priorityLabels)) {
    event.target.setCustomValidity('')
  } else {
    event.target.setCustomValidity('The priority value must be unique')
  }
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
          'labels'
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
      dispatch(updateSelectedLabel(labelJson.objects[0].label_id))
    } catch (e) {
      return dispatch(
        setError('La réponse ne contient pas de json (label)', 'labels')
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
          setError('La réponse ne contient pas de json (priorité)', 'labels')
        )
      }
    } else {
      return dispatch(
        setErrorLabels(`Erreur [${response.status}] ${response.statusText}`)
      )
    }
  }
  dispatch(fetchResults('labels'))
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
      dispatch(fetchResults('labels'))
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
  selectedLabelType,
  actionType,
  label = null
) => dispatch => {
  const newLabel = {
    label_type: selectedLabelType,
    text: event.target.labelName.value,
    color: event.target.labelColor.value,
  }
  if (actionType === 'edition') {
    newLabel.label_id = label.label_id
  }
  const priorityData = event.target.labelPriority
    ? actionType === 'edition'
      ? {
          priority_id: label.priority_id,
          value: +event.target.labelPriority.value,
        }
      : +event.target.labelPriority.value
    : null
  dispatch(addOrEditLabelAndPriority(newLabel, priorityData, actionType))
}

export const getUnusedCircleLabels = (circles, labels) => {
  const unusedLabels = labels.filter(
    label =>
      circles.filter(circle => circle.label_id === label.label_id).length === 0
  )
  return unusedLabels
}
