/**
 * @desc: 0.44 ～ 0.48.x 版本的rn的 textinput multiline 在android下无法换行
 * 在以下解决方案下封装
 *
 * This is a workaround for the buggy react-native TextInput multiline on Android.
 *
 * Can be removed once https://github.com/facebook/react-native/issues/12717
 * is fixed.
 *
 * Example for usage:
 *   <MultilineTextInput value={this.state.text} onChangeText={text => setState({text})} />
 */

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
    value: PropTypes.string.isRequired,
    onChangeText: PropTypes.func.isRequired
  }
  constructor (props) {
    super(props)
    this.state = { selection: { start: 0, end: 0 } }
    // Prevent 2 newlines for some Android versions, because they dispatch onSubmitEditing twice
    this.onSubmitEditing = MultilineTextInput.debounce(this.onSubmitEditing.bind(this), 100)
  }
  componentWillReceiveProps (props) {
    if (props.selection) {
      this.setState({ selection: props.selection })
    }
  }
  onSubmitEditing = () => {
    const { selection } = this.state
    const { value } = this.props
    const newText = `${value.slice(0, selection.start)}\n${value.slice(selection.end)}`
    this.props.onChangeText(newText)
    // move cursor only for this case, because in other cases a change of the selection is not allowed by Android
    if (selection.start !== value.length && selection.start === selection.end) {
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
  onContentSizeChange = (event) => {
    if (this.props.autoHeight) {
      this.setState({height: event.nativeEvent.contentSize.height})
    }
  }
  render () {
    const { style, ...restProps } = this.props
    return (
      <TextInput
        style={[style, {height: this.state.height}]}
        multiline
        blurOnSubmit={false}
        selection={this.state.selection}
        value={this.props.value}
        onSelectionChange={event => this.setState({ selection: event.nativeEvent.selection })}
        onChangeText={this.props.onChangeText}
        onSubmitEditing={this.onSubmitEditing}
        onContentSizeChange={this.onContentSizeChange}
        {...restProps}
      />
    )
  }
}
