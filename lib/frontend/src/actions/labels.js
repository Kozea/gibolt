import { setError, setResults } from './index'

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
