/**
 * @author zhangweilin
 * @desc 0.44 ～ 0.48.x 版本的rn的 textinput multiline 在android下无法换行
 * 在以下解决方案下封装
 *
 * This is a workaround for the buggy react-native TextInput multiline on Android.
 *
 * Can be removed once https://github.com/facebook/react-native/issues/12717
 * is fixed.
 *
 * Example for usage:
 *   <MultilineTextInput defaultValue={this.state.text} onChangeText={text => setState({text})} />
 */

