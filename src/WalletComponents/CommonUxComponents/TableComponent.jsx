import React from 'react';
import FlexView from "react-flexview";
import PropTypes from 'prop-types';

import "../../styles/main.css";
import "../../styles/new_pix_style.css";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";

export default function TableComponent(props) {

    return (
        <FlexView column style={{ marginTop: "1.5rem" }}>
            <div className="pixTableRightContent tableRightStyle highEmphasis"
                style={{ textAlign: "left", width: "100%", paddingBottom: ".5rem", display: "inline-flex" }}>
                <img src={(props.icon)} alt="" className="pixReceiverSenderIcon" />
                {props.detailHeader}
            </div>

            {
                Object.keys(props.array).map((key, idx) => {
                    return (
                        <div key={idx} style={{ justifyContent: "space-between", marginTop: ".375rem" }}>
                            <span className="pixTableLeftContent tableLeftStyle mediumEmphasis" >{key}</span>
                            <span className="pixTableRightContent tableRightStyle highEmphasis" >{props.array[key]}</span>
                        </div>
                    )
                })
            }
        </FlexView>
    )
}

TableComponent.propTypes = {
    icon: PropTypes.string,
    detailHeader: PropTypes.string,
    array: PropTypes.object,
  };