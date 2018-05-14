/* eslint-disable no-underscore-dangle */

import PropTypes from 'prop-types';
import React from 'react';
import _isEqual from 'lodash/isEqual';
import TypeMap from './types';

const InvalidType = () => <span>Invalid Type</span>;

const stylesheet = {
  field: {
    display: 'table-row',
    padding: '5px',
  },
  link: {
    cursor: 'pointer',
    color: 'blue',
    textDecoration: 'underline',
  },
  label: {
    display: 'table-cell',
    boxSizing: 'border-box',
    verticalAlign: 'top',
    paddingRight: 5,
    paddingTop: 5,
    textAlign: 'right',
    width: 80,
    fontSize: 12,
    color: 'rgb(68, 68, 68)',
    fontWeight: 600,
  },
};

stylesheet.textarea = {
  ...stylesheet.input,
  height: '100px',
};

stylesheet.checkbox = {
  ...stylesheet.input,
  width: 'auto',
};

export default class PropField extends React.Component {
  constructor(props) {
    super(props);
    this._onChange = this.onChange.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    const prevProps = this.props;
    if (_isEqual(nextProps.knob, prevProps.knob)) {
      return false;
    }
    return true;
  }

  onChange(e) {
    this.props.onChange(e.target.value);
  }

  renderLabel(knob) {
    const linkTo = knob.linkTo;
    if (linkTo && linkTo.kind && linkTo.story) {
      const handleLinkedLabel = () => {
        this.props.onLinkedLabelClick(linkTo);
      };

      return (
        <label htmlFor={linkTo.story} style={stylesheet.label}>
          <div tabIndex={0} role="button" style={stylesheet.link} onClick={handleLinkedLabel}>
            {knob.name}
          </div>
        </label>
      );
    }
    return (
      <label htmlFor={knob.name} style={stylesheet.label}>
        {knob.name}
      </label>
    );
  }

  render() {
    const { onChange, knob } = this.props;

    const InputType = TypeMap[knob.type] || InvalidType;

    return (
      <div style={stylesheet.field}>
        {this.renderLabel(knob)}
        <InputType knob={knob} onChange={onChange} />
      </div>
    );
  }
}

PropField.propTypes = {
  knob: PropTypes.shape({
    linkTo: PropTypes.oneOfType([
      PropTypes.shape({
        kind: PropTypes.string,
        story: PropTypes.string,
      }),
      PropTypes.string,
    ]),
    name: PropTypes.string,
    value: PropTypes.any,
  }).isRequired,
  onLinkedLabelClick: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
};
