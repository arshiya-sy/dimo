import React from 'react';
import Log from '../Services/Log';
import { CSSTransition } from 'react-transition-group';
import localeListService from '../Services/localeListService';
import PixErrorComponent from '../WalletComponents/CommonUxComponents/ErrorTemplate';
import PageNames from '../Services/PageNames';
import PrimaryButtonComponent from '../WalletComponents/CommonUxComponents/PrimaryButtonComponent';
import InputThemes from '../Themes/inputThemes';

var localeObj = {};
const PageNameJSON = PageNames.ErrorBoundary;

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            pixErrorJson: {}
        }

        if (Object.keys(localeObj).length === 0) {
            localeObj = localeListService.getActionLocale();
        }

    }

    static getDerivedStateFromError(error) {
        let jsonObject = {};
        // You can check the error message here to determine if it's a chunk loading error
        Log.sDebug("chunk error", error.message)
        if (error.message.includes('ChunkLoadError') ||
            error.message.includes('Loading CSS') ||
            error.message.includes('Loading chunk')) {
            jsonObject["header"] = localeObj.tryAgainLater;
            return { hasError: true, pixErrorJson: jsonObject };
        }
        return null;
    }

    componentDidCatch() {
        Log.sDebug("Chunk error found and recovered")
    }
    onComplete = () => {
        window.location.reload()
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ textAlign: "center", fontSize: "2em", fontWeight: "500" }}>
                    <CSSTransition mountOnEnter={true} unmountOnExit={true}
                        in={this.state.hasError ? true : false} timeout={300}
                        classNames="pageSliderLeft" >
                        <div>
                            <PixErrorComponent errorJson={this.state.pixErrorJson} onClick={this.onComplete} componentName={PageNameJSON} />
                        </div>
                    </CSSTransition>
                    <div style={{...InputThemes.bottomButtonStyle, textAlign: "center"}}>
                        <PrimaryButtonComponent btn_text={localeObj.no_internet_retry} onCheck={() => window.location.reload()} />
                    </div>
                </div>
            )
        }

        return this.props.children;
    }
}
export default ErrorBoundary;