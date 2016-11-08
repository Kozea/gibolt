import { connect } from 'react-redux'
import { startCounter, stopCounter, resetCounter, deleteLog, log } from '../actions'
import Counter from '../components/Counter'

const StartCounter = connect((state) => {
    return {
      count: state.count.val
    }
  }, (dispatch, props) => {
    return {
      onResetClick: (count) => {
        dispatch(resetCounter())
        dispatch(log('Reset'))
      },
      onStartCounter: () => dispatch(startCounter()),
      onStopCounter: () => dispatch(stopCounter()),

    }
  })(Counter)

  export default StartCounter
