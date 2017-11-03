import React from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash.debounce';

import PropForm from './PropForm';

const getTimestamp = () => +new Date();

const styles = {
  panelWrapper: {
    width: '100%',
  },
  panel: {
    padding: '5px',
    width: 'auto',
    position: 'relative',
  },
  noKnobs: {
    fontFamily: `
      -apple-system, ".SFNSText-Regular", "San Francisco", "Roboto",
      "Segoe UI", "Helvetica Neue", "Lucida Grande", sans-serif
    `,
    display: 'inline',
    width: '100%',
    textAlign: 'center',
    color: 'rgb(190, 190, 190)',
    padding: '10px',
  },
  resetButton: {
    position: 'absolute',
    bottom: 11,
    right: 10,
    border: 'none',
    borderTop: 'solid 1px rgba(0, 0, 0, 0.2)',
    borderLeft: 'solid 1px rgba(0, 0, 0, 0.2)',
    background: 'rgba(255, 255, 255, 0.5)',
    padding: '5px 10px',
    borderRadius: '4px 0 0 0',
    color: 'rgba(0, 0, 0, 0.5)',
    outline: 'none',
  },
};

export default class Panel extends React.Component {
  constructor(props) {
    super(props);
    this.handleLinkedLabel = this.handleLinkedLabel.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.setKnobs = this.setKnobs.bind(this);
    this.setKnob = this.setKnob.bind(this);
    this.reset = this.reset.bind(this);
    this.setOptions = this.setOptions.bind(this);

    this.state = { knobs: {} };
    this.options = {};

    this.lastEdit = getTimestamp();
    this.loadedFromUrl = false;
    this.props.channel.on('addon:knobs:setKnobs', this.setKnobs);
    this.props.channel.on('addon:knobs:setKnob', this.setKnob);
    this.props.channel.on('addon:knobs:setOptions', this.setOptions);

    this.stopListeningOnStory = this.props.api.onStory(() => {
      this.setState({ knobs: [] });
      this.props.channel.emit('addon:knobs:reset');
    });
  }

  componentWillUnmount() {
    this.props.channel.removeListener('addon:knobs:setKnobs', this.setKnobs);
    this.stopListeningOnStory();
  }

  setOptions(options = { debounce: false, timestamps: false }) {
    this.options = options;

    if (options.debounce) {
      this.emitChange = debounce(this.emitChange, options.debounce.wait, {
        leading: options.debounce.leading,
      });
    }
  }

  setKnobs({ knobs, timestamp }) {
    if (!this.options.timestamps || !timestamp || this.lastEdit <= timestamp) {
      this.setState({ knobs });
    }
  }

  setKnob({ knob, timestamp }) {
    const { knobs } = this.state;
    if (!this.options.timestamps || !timestamp || this.lastEdit <= timestamp) {
      this.setState({
        knobs: {
          ...knobs,
          [knob.name]: knob,
        },
      });
    }
  }

  reset() {
    this.props.channel.emit('addon:knobs:reset');
  }

  emitChange(changedKnob) {
    this.props.channel.emit('addon:knobs:knobChange', changedKnob);
  }

  handleLinkedLabel(selection) {
    this.props.api.selectStory(selection.kind, selection.story);
  }

  handleChange(changedKnob) {
    this.lastEdit = getTimestamp();
    const { knobs } = this.state;
    const { name } = changedKnob;
    const newKnobs = { ...knobs };
    newKnobs[name] = {
      ...newKnobs[name],
      ...changedKnob,
    };

    this.setState({ knobs: newKnobs }, this.emitChange(changedKnob));
  }

  render() {
    const { knobs } = this.state;
    const knobsArray = Object.keys(knobs).filter(key => knobs[key].used).map(key => knobs[key]);

    if (knobsArray.length === 0) {
      return <div style={styles.noKnobs}>NO KNOBS</div>;
    }

    return (
      <div style={styles.panelWrapper}>
        <div style={styles.panel}>
          <PropForm
            knobs={knobsArray}
            onLinkedLabelClick={this.handleLinkedLabel}
            onFieldChange={this.handleChange}
          />
        </div>
        <button style={styles.resetButton} onClick={this.reset}>
          RESET
        </button>
      </div>
    );
  }
}

Panel.propTypes = {
  channel: PropTypes.shape({
    emit: PropTypes.func,
    on: PropTypes.func,
    removeListener: PropTypes.func,
  }).isRequired,
  onReset: PropTypes.object, // eslint-disable-line
  api: PropTypes.shape({
    onStory: PropTypes.func,
    selectStory: PropTypes.func,
    getQueryParam: PropTypes.func,
    setQueryParams: PropTypes.func,
  }).isRequired,
};
