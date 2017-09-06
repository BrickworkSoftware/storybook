import PropTypes from 'prop-types';
import React from 'react';
import CodeMirror from 'react-codemirror';

import 'codemirror/mode/css/css.js';
import 'codemirror/mode/javascript/javascript.js';
import 'codemirror/lib/codemirror.css';

class CodeType extends React.Component {
  render() {
    const { knob, onChange } = this.props;

    return (
      <CodeMirror
        id={knob.name}
        ref={c => {
          this.input = c;
        }}
        value={knob.value}
        onChange={onChange}
        options={{ mode: knob.mode }}
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
