import React from 'react';
import FlexView from "react-flexview";

import "../../styles/main.css";
import "../../styles/new_pix_style.css";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import PropTypes from 'prop-types';

export default function TableDownloadComponent(props) {

    return (
        <FlexView column style={{ marginTop: "1.5rem" }}>
            <div className="pixTableRightContent tableRightStyle btnHighEmphasis"
                style={{ textAlign: "left", width: "100%", paddingBottom: ".5rem", display: "inline-flex" }}>
                <img src={(props.icon)} alt={"pixreceive"} className="pixReceiverSenderIcon" />
                {props.detailHeader}
            </div>

            {
                Object.keys(props.array).map((key, idx) => {
                    return (
                        <div key={idx} style={{ justifyContent: "space-between", marginTop: ".375rem" }}>
                            <span className="pixTableLeftContent tableLeftStyle btnMediumEmphasis" >{key}</span>
                            <span className="pixTableRightContent tableRightStyle btnHighEmphasis" >{props.array[key]}</span>
                        </div>
                    )
                })
            }
        </FlexView>
    )
}

TableDownloadComponent.propTypes = {
    icon: PropTypes.string,
    detailHeader: PropTypes.string,
    array: PropTypes.object,
  };