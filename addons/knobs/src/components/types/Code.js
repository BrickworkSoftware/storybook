import PropTypes from 'prop-types';
import React from 'react';
import CodeMirror from 'react-codemirror';

import 'codemirror/mode/css/css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/lib/codemirror.css';

class CodeType extends React.Component {
  constructor(props) {
    super(props);
    this.key = 0;
    this.value = props.knob.value;
  }

  componentDidMount() {
    this.input.getCodeMirror().setOption('extraKeys', {
      Tab(cm) {
        const spaces = Array(cm.getOption('indentUnit') + 1).join(' ');
        cm.replaceSelection(spaces);
      },
    });
  }

  shouldComponentUpdate(nextProps) {
    if (this.value !== nextProps.knob.value) {
      return true;
    }
    return false;
  }

  componentWillUpdate() {
    const { knob } = this.props;
    this.value = knob.value;
    this.key = this.key + 1;
  }

  handleChange = value => {
    const { onChange } = this.props;

    this.value = value;
    onChange(value);
  };

  render() {
    const { knob } = this.props;
    const { readOnly = false, lineNumbers = false } = knob;

    return (
      <CodeMirror
        id={knob.name}
        ref={c => {
          this.input = c;
        }}
        key={this.key}
        value={knob.value}
        onChange={this.handleChange}
        options={{ mode: knob.mode, readOnly, lineNumbers, tabSize: 2 }}
      />
    );
  }
}

CodeType.defaultProps = {
  knob: {},
  onChange: value => value,
};

CodeType.propTypes = {
  knob: PropTypes.shape({
    name: PropTypes.string,
    value: PropTypes.string,
  }),
  onChange: PropTypes.func,
};

CodeType.serialize = value => value;
CodeType.deserialize = value => value;

export default CodeType;
