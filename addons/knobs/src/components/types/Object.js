import PropTypes from 'prop-types';
import React from 'react';
import CodeMirror from 'react-codemirror';
import deepEqual from 'deep-equal';
import insertCss from 'insert-css';

import 'codemirror/mode/javascript/javascript.js';
import 'codemirror/lib/codemirror.css';

const customStyle = `
.CodeMirror__jsonError {
  border: 1px solid #fadddd;
  backgroundColor: #fff5f5;
}
`;
insertCss(customStyle);

class ObjectType extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = {};
  }

  getJSONString() {
    const { json, jsonString } = this.state;
    const { knob } = this.props;

    // If there is an error in the JSON, we need to give that errored JSON.
    if (this.failed) return jsonString;

    // If the editor value and the knob value is the same, we need to return the
    // editor value as it allow user to add new fields to the JSON.
    if (deepEqual(json, knob.value)) return jsonString;

    // If the knob's value is different from the editor, it seems like
    // there's a outside change and we need to get that.
    return JSON.stringify(knob.value, null, 2);
  }

  handleChange(value) {
    const { onChange } = this.props;
    const newState = {
      jsonString: value,
    };

    try {
      newState.json = JSON.parse(value.trim());
      onChange(newState.json);
      this.failed = false;
    } catch (err) {
      this.failed = true;
    }

    this.setState(newState);
  }

  render() {
    const { knob } = this.props;
    const jsonString = this.getJSONString();

    return (
      <CodeMirror
        className={this.failed ? 'CodeMirror__jsonError' : null}
        id={knob.name}
        ref={c => {
          this.input = c;
        }}
        value={jsonString}
        onChange={value => this.handleChange(value)}
        options={{ mode: 'javascript' }}
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
    name: PropTypes.string,
    value: PropTypes.object,
  }),
  onChange: PropTypes.func,
};

ObjectType.serialize = object => JSON.stringify(object);
ObjectType.deserialize = value => (value ? JSON.parse(value) : {});

export default ObjectType;
