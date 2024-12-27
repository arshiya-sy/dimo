import React from 'react';
import PropTypes from "prop-types";

import "../../styles/shimmerStyles.css";
import "../../styles/commonBsStyles.css";

export default function ShimmerComponent(props) {
    const { loadingComponents = [], totalComponents = 1, containerClasses = {} } = props;

    const renderComponent = (index, name, classNames) => (<div key={index} className={`loading-${name} loading ${classNames}`}></div>);

    const renderLoadingComponents = (components) => (
        components.map((component, index) => {
            if (component.name === "inline-content") {
                return (
                    <div key={index} className='d-grid' style={{ gridTemplateColumns: `${component.leftContentSize || 1}fr ${component.leftContentSize || 4}fr` }}>
                        <div className="left-loading-content">
                            {renderLoadingComponents(component.inlineLeftContents)}
                        </div>
                        <div className="right-loading-content">
                            {renderLoadingComponents(component.inlineRightContents)}
                        </div>
                    </div>
                );
            }
            
            return renderComponent(index, component.name, component.classNames);
        })
    );

    const shimmerContent = (
        <div id="shimmer">
            <div className={`loading-page ${containerClasses.pageClassNames || ''}`}>
                <div className={`loading-container ${containerClasses.containerClassNames || ''}`}>
                    <div className={`loading-body ${containerClasses.bodyClassNames || ''}`}>
                        {renderLoadingComponents(loadingComponents)}
                    </div>
                </div>
            </div>
        </div>
    );

    const shimmerElements = [];

    for (let i = 0; i < totalComponents; i++) {
        shimmerElements.push(<div key={i}>{shimmerContent}</div>);
    }

    return shimmerElements;
}

ShimmerComponent.propTypes = {
    totalComponents: PropTypes.number,
    loadingComponents: PropTypes.array,
    containerClasses: PropTypes.object,
};
