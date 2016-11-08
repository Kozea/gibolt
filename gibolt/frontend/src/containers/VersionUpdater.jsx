import { connect } from 'react-redux'
import { getVersion } from '../actions'
import Version from '../components/Version'

const VersionUpdater = connect((state) => {
    return {
      version: state.version
    }
  }, (dispatch, props) => {
    return {
      onSetVersion: () => dispatch(getVersion()),

    }
  })(Version)

  export default VersionUpdater
