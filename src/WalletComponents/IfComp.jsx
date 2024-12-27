import React from 'react';
import PropTypes from "prop-types";

export default class IfComp extends React.Component {
    render() {
        return (
          this.props.showMe ? this.props.children  : null
        );
    }
}

IfComp.propTypes = {
  showMe: PropTypes.bool,
  children: PropTypes.children,
};