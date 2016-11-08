import { connect } from 'react-redux'
import { deleteLog } from '../actions'
import LogList from '../components/LogList'

const Log = connect((state) => {
    return {
      messages: state.messages
    }
  }, (dispatch) => {
    return {
      onLogClick: (messageId) => {
        dispatch(deleteLog(messageId))
      }
    }
  })(LogList)

  export default Log
