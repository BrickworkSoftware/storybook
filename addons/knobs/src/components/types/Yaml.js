import PropTypes from 'prop-types';
import React from 'react';
import CodeMirror from 'react-codemirror';
import deepEqual from 'deep-equal';
import insertCss from 'insert-css';
import yaml from 'js-yaml';
import _mapValues from 'lodash/mapValues';

import 'codemirror/mode/yaml/yaml';
import 'codemirror/lib/codemirror.css';

const customStyle = `
.CodeMirror__error {
  border: 1px solid #fadddd;
  backgroundColor: #fff5f5;
}
`;
insertCss(customStyle);

function yamlStringify(valueObject) {
  return yaml.safeDump(valueObject);
}
function yamlParse(valueObject) {
  return yaml.safeLoad(valueObject);
}

class ObjectType extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      key: 0,
      yamlString: yamlStringify(props.knob.value),
      value: props.knob.value,
      propTypes: _mapValues(props.knob.value, optionValue => typeof optionValue),
    };
  }

  componentDidMount() {
    this.input.getCodeMirror().setOption('extraKeys', {
      Tab(cm) {
        const spaces = Array(cm.getOption('indentUnit') + 1).join(' ');
        cm.replaceSelection(spaces);
      },
    });
  }

  componentWillReceiveProps(nextProps) {
    const { value } = this.state;

    if (!deepEqual(value, nextProps.knob.value)) {
      this.setState({
        yamlString: yamlStringify(nextProps.knob.value),
        value: nextProps.knob.value,
        key: this.state.key + 1,
      });
    }
  }

  handleChange = valueString => {
    const { onChange } = this.props;

    const { propTypes } = this.state;

    try {
      const value = yamlParse(valueString.trim());
      /* eslint-disable valid-typeof */
      const divergentKeys = Object.keys(value).filter(
        keyName => typeof value[keyName] !== propTypes[keyName]
      );
      /* eslint-enable valid-typeof */
      if (divergentKeys.length) {
        throw Error('Wrong prop types provided for:', JSON.stringify(divergentKeys));
      }
      this.setState({
        value,
        yamlString: yamlStringify(value),
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

    const { failed, yamlString, key } = this.state;

    return (
      <CodeMirror
        key={key}
        className={failed ? 'CodeMirror CodeMirror__error' : 'CodeMirror'}
        id={knob.key}
        ref={c => {
          this.input = c;
        }}
        value={yamlString}
        onChange={this.handleChange}
        options={{ mode: 'yaml', readOnly, lineNumbers, tabSize: 2 }}
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

ObjectType.serialize = object => yamlStringify(object);
ObjectType.deserialize = value => (value ? yamlParse(value) : {});

export default ObjectType;
