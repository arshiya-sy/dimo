import React from "react";
import "../../styles/main.css";

import dimo_logo from "../../images/DarkThemeImages/Dimo-Logo_4x.png";

export default class DimoFlashComponent extends React.Component {
    render() {
        const screenHeight = window.screen.height;
        const screenWidth = window.screen.width;
        return (
            <div className='sucessPage' style={{ overflowX: "hidden", width: screenWidth, height: screenHeight }}>
                <img style={{
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    height: '5rem',
                    width: '14rem'
                }} src={dimo_logo} alt=""></img>
            </div >
        );
    }
}
