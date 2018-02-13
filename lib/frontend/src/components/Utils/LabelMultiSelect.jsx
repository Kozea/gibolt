import 'react-select/dist/react-select.css'

import React from 'react'
import Select from 'react-select'

export default class LabelMultiSelect extends React.Component {
  constructor(props, context) {
    super(props, context)
    this.updateOptions(props.value)
    this.state = {
      value: props.value,
      options: props.options,
    }
  }

  updateOptions(value) {
    const types = []
    value.filter(label => {
      if (!types.find(x => x === label.type)) {
        types.push(label.type)
      }
    })
    this.props.options.map(opt => {
      opt.disabled = !(typeof types.find(x => x === opt.type) === 'undefined')
    })
  }

  handleSelectChange(value) {
    this.updateOptions(value)
    this.setState({
      value,
    })
  }

  renderValue(option) {
    return <strong style={{ color: option.color }}>{option.label}</strong>
  }

  render() {
    return (
      <Select
        closeOnSelect={this.props.closeOnSelect}
        multi
        name="labelMultiSelect"
        options={this.state.options}
        removeSelected={this.props.removeSelected}
        onChange={v => this.handleSelectChange(v)}
        value={this.state.value}
        valueRenderer={this.renderValue}
      />
    )
  }
}
