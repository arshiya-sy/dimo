import React from 'react';
import PropTypes from 'prop-types';

import Log from "../../Services/Log";

/**
 * Component to wrap the existing component rendering along with a timeout for click action on the same
 * @param  {Component} Component - Component for which click has to be disabled for specified time
 * @param  {Number} timeout - Number of milliseconds for which click has to be disabled after a click
 * @return {Component}        Returns the corresponding wrapped up component with timeout
 */

const ClickWithTimeout = (Component) => class extends React.Component {
  static displayName = 'ClickWithTimeout';

  static propTypes = {
    timeout: PropTypes.any,
    onClick: PropTypes.func,
    onCheck: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      isTimeout: false,
    }
    this.timeout = props.timeout || 3000;

    this.componentName = "ClickWithTimeout";
  }

  newClick = ($event) => {
    if (this.state.isTimeout) {
      $event.preventDefault();
      return;
    } else {
      try {
        this.setState({isTimeout: true});
        this.props.onClick($event);
      } catch (error) {
        Log.sDebug("Error inside newClick: " + error.message, this.componentName);
      }

      setTimeout(() => {
        this.setState({isTimeout: false});
      }, this.timeout);
    }
  }

  newCheck = ($event) => {
    if ($event && this.state.isTimeout) {
      $event.preventDefault();
      return;
    } else {
      try {
        this.setState({isTimeout: true});
        this.props.onCheck($event);
      } catch (error) {
        Log.sDebug("Error inside newCheck: " + error.message, this.componentName);
      }

      setTimeout(() => {
        this.setState({isTimeout: false});
      }, this.timeout);
    }
  }

  render() {
    return <Component {...this.props} onClick={this.newClick} onCheck={this.newCheck} />;
  }
}

export default ClickWithTimeout;