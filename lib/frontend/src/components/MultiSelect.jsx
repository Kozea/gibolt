import 'react-select/dist/react-select.css'

import React from 'react'
import Select from 'react-select'

export default class MultiSelect extends React.Component {
  constructor(props, context) {
    super(props, context)
    this.state = {
      value: '',
    }
  }

  handleSelectChange(value) {
    this.setState({ value })
  }

  render() {
    return (
      <Select
        closeOnSelect={this.props.closeOnSelect}
        multi
        options={this.props.options}
        removeSelected={this.props.removeSelected}
        onChange={v => this.handleSelectChange(v)}
        simpleValue
        value={this.state.value}
      />
    )
  }
}
