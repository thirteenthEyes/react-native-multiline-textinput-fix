import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { TextInput, StyleSheet } from 'react-native'

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
    onChangeText: PropTypes.func.isRequired,
    allowAutoHeight: PropTypes.boolean // 允许自动调整文本框高度
  }
  constructor (props) {
    super(props)
    this.state = {
      selection: { start: 0, end: 0 },
      // 初始化时使用defaultValue作为本组件的text
      text: this.props.defaultValue,
      height: 0
    }
    // 防止某些安卓机型触发两次onSubmitEditing
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
    // 触发_onSubmitEditing时，当光标位置不在文字末尾且没有选中任何文字时，则将光标后移一个位置
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
    if (!!this.props.allowAutoHeight) {
      this.setState({height: event.nativeEvent.contentSize.height})
    }
  }
  _onChangeText = (text) => {
    this.setState({text})
    this.props.onChangeText(text)
  }
  render () {
    const { style: propsStyle, onChangeText, ...restProps } = this.props
    let computedHeight = this.state.height
    if (propsStyle) {
      // 用StyleSheet格式化props style，以读取minHeight以及height属性
      const propsStyleObj = StyleSheet.flatten(propsStyle)
      computedHeight = Math.max(this.state.height, propsStyleObj.minHeight || 0, propsStyleObj.height || 0)
    }

    return (
      <TextInput
        {...restProps}
        style={[propsStyle, {height: computedHeight}]}
        underlineColorAndroid='transparent'
        multiline
        blurOnSubmit={false}
        selection={this.state.selection}
        value={this.state.text}
        onSelectionChange={event => this.setState({ selection: event.nativeEvent.selection })}
        onChangeText={this._onChangeText}
        onSubmitEditing={this._onSubmitEditing}
        onContentSizeChange={this._onContentSizeChange}
      />
    )
  }
}
