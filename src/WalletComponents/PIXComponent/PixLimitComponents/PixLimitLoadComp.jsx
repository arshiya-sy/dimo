import React from "react";
import "../../../styles/main.css";
import "../../../styles/genericFontStyles.css";
import "../../../styles/colorSelect.css";

import localeService from "../../../Services/localeListService";
import androidApiCalls from "../../../Services/androidApiCallsService";

var localeObj = {};

export default class PixLimitLoadComp extends React.Component {
    constructor(props) {
        super(props);
        this.style = {
            blockStyle: {
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                marginTop: "5.5rem"
            },
            subTextStyle: {
                marginTop: "0.75rem",
            }
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);
    }
       

    render() {
        return (
            <div>
                <div style={this.style.blockStyle}>
                    <div style={{ textAlign: "center" }}>
                        <div className="subtitle4 highEmphasis">{localeObj.daily} </div>
                        <section style={this.style.subTextStyle}>
                            <div className="shimmer-bar-6 shimming"></div>
                        </section>
                    </div>
                    <div style={{ textAlign: "center", marginTop: "4.5rem" }}>
                        <div className="subtitle4 highEmphasis">{localeObj.nightly}</div>
                        <section style={this.style.subTextStyle}>
                            <div className="shimmer-bar-6 shimming"></div>
                        </section>
                    </div>
                </div>
            </div >
        )
    }
}