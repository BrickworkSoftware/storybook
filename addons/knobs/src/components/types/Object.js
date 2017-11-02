import PropTypes from 'prop-types';
import React from 'react';
import CodeMirror from 'react-codemirror';
import deepEqual from 'deep-equal';
import insertCss from 'insert-css';

import 'codemirror/mode/javascript/javascript';
import 'codemirror/lib/codemirror.css';

const customStyle = `
.CodeMirror__error {
  border: 1px solid #fadddd;
  backgroundColor: #fff5f5;
}
`;
insertCss(customStyle);

function getJSONString(valueObject) {
  return JSON.stringify(valueObject, null, 2);
}

class ObjectType extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      key: 0,
      jsonString: getJSONString(props.knob.value),
      value: props.knob.value,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { value } = this.state;

    if (!deepEqual(value, nextProps.knob.value)) {
      this.setState({
        jsonString: getJSONString(nextProps.knob.value),
        value: nextProps.knob.value,
        key: this.state.key + 1,
      });
    }
  }

  handleChange = valueString => {
    const { onChange } = this.props;

    try {
      const value = JSON.parse(valueString.trim());
      this.setState({
        value,
        jsonString: getJSONString(value),
        failed: false,
      });
      onChange(value);
    } catch (err) {
      this.setState({
        failed: true,
      });
    }
  };

  render() {
    const { knob } = this.props;
    const { readOnly = false, lineNumbers = false } = knob;

    const { failed, jsonString, key } = this.state;

    return (
      <CodeMirror
        key={key}
        className={failed ? 'CodeMirror CodeMirror__error' : 'CodeMirror'}
        id={knob.key}
        ref={c => {
          this.input = c;
        }}
        value={jsonString}
        onChange={this.handleChange}
        options={{ mode: { name: 'javascript', json: true }, readOnly, lineNumbers, tabSize: 2 }}
      />
    );
  }
}

ObjectType.defaultProps = {
  knob: {},
  onChange: value => value,
};

ObjectType.propTypes = {
  knob: PropTypes.shape({
    name: PropTypes.any,
    value: PropTypes.object,
  }),
  onChange: PropTypes.func,
};

ObjectType.serialize = object => JSON.stringify(object);
ObjectType.deserialize = value => (value ? JSON.parse(value) : {});

export default ObjectType;
