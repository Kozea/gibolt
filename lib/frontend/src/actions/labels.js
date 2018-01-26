import { setError, setResults } from './index'

export const updateSelectedLabelType = labelTypeId => ({
  type: 'UPDATE_LABEL_TYPE',
  labelTypeId,
})

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

export const addLabelAndPriority = (
  newLabel,
  newPriorityValue
) => async dispatch => {
  let response, labelJson

  try {
    response = await fetch('api/labels', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newLabel),
    })
  } catch (e) {
    return dispatch(
      setError('Erreur pendant la création du label', 'adminLabels')
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
    return dispatch(
      setError(
        `Erreur [${response.status}] ${response.statusText}`,
        'adminLabels'
      )
    )
  }
  if (newPriorityValue) {
    const newPriority = {
      label_id: labelJson.objects[0].label_id,
      value: newPriorityValue,
    }
    try {
      response = await fetch('api/priorities', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPriority),
      })
    } catch (e) {
      return dispatch(
        setError('Erreur pendant la création de la priorité', 'adminLabels')
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
        setError(
          `Erreur [${response.status}] ${response.statusText}`,
          'adminLabels'
        )
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
      setError(
        `Erreur pendant la suppression du label "${labelId}"`,
        'adminLabels'
      )
    )
  }
  if (response.status >= 200 && response.status < 300) {
    try {
      await response.json()
      dispatch(fetchLabels())
    } catch (e) {
      console.error(e)
      return dispatch(
        setError('La réponse ne contient pas de json', 'adminLabels')
      )
    }
  } else {
    return dispatch(
      setError(
        `Erreur [${response.status}] ${response.statusText}`,
        'adminLabels'
      )
    )
  }
}
