import React from 'react'
import Select from 'react-select'

const customStyles = {
  option: (provided, state) => ({
    ...provided,
    color: state.data.color,
  }),
  multiValue: styles => ({
    ...styles,
    border: '1px solid #b3d8ff',
    backgroundColor: '#ebf5ff',
  }),
  multiValueLabel: (styles, { data }) => ({
    ...styles,
    color: data.color,
  }),
  multiValueRemove: (styles, { data }) => ({
    ...styles,
    color: data.color,
    ':hover': {
      backgroundColor: data.color,
      color: 'white',
    },
  }),
}

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

  render() {
    return (
      <Select
        className="Select-control"
        closeMenuOnSelect={this.props.closeOnSelect}
        hideSelectedOptions={this.props.removeSelected}
        isMulti
        name="labelMultiSelect"
        onChange={v => this.handleSelectChange(v)}
        options={this.state.options}
        styles={customStyles}
        value={this.state.value}
      />
    )
  }
}
