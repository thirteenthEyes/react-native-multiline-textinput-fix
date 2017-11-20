import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { TextInput } from 'react-native'

export default class MultilineTextInput extends PureComponent {
  static debounce (fn, time) {
    let t
    return () => {
      t && clearTimeout(t)
      t = setTimeout(() => {
        fn()
      }, time)
    }
  }
  static propTypes = {
    defaultValue: PropTypes.string.isRequired,
    onChangeText: PropTypes.func.isRequired
  }
  constructor (props) {
    super(props)
    this.state = {
      selection: { start: 0, end: 0 },
      text: this.props.defaultValue
    }
    // Prevent 2 newlines for some Android versions, because they dispatch onSubmitEditing twice
    this._onSubmitEditing = MultilineTextInput.debounce(this._onSubmitEditing.bind(this), 100)
  }
  componentWillReceiveProps (props) {
    if (props.selection) {
      this.setState({ selection: props.selection })
    }
  }
  _onSubmitEditing () {
    const { selection, text } = this.state
    const newText = `${text.slice(0, selection.start)}\n${text.slice(selection.end)}`
    this.props.onChangeText(newText)
    this.setState({text: newText})
    // move cursor only for this case, because in other cases a change of the selection is not allowed by Android
    if (selection.start !== text.length && selection.start === selection.end) {
      const newSelection = {
        selection: {
          start: selection.start + 1,
          end: selection.end + 1
        }
      }
      if (this.props.onSelectionChange) {
        this.props.onSelectionChange({ nativeEvent: newSelection })
      } else {
        this.onSelectionChange({selection: newSelection})
      }
    }
  }
  _onContentSizeChange = (event) => {
    if (this.props.autoHeight) {
      this.setState({height: event.nativeEvent.contentSize.height})
    }
  }
  _onChangeText = (text) => {
    this.setState({text})
    this.props.onChangeText(text)
  }
  render () {
    const { style, onChangeText, ...restProps } = this.props
    return (
      <TextInput
        {...restProps}
        style={[style, this.state.height ? {height: Math.max(this.state.height, style.minHeight || 0, style.height || 0)} : {}]}
        underlineColorAndroid='transparent'
        multiline
        blurOnSubmit={false}
        selection={this.state.selection}
        value={this.state.text}
        // defaultValue={this.props.defaultValue}
        onSelectionChange={event => this.setState({ selection: event.nativeEvent.selection })}
        onChangeText={this._onChangeText}
        onSubmitEditing={this._onSubmitEditing}
        onContentSizeChange={this._onContentSizeChange}
      />
    )
  }
}
