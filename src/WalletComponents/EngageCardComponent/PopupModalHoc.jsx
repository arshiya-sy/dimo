import React from "react";
import ReactDOM from "react-dom";
import PropTypes from 'prop-types';

import Log from "../../Services/Log";
import constantObjects from "../../Services/Constants";
import GlobalDataStore from "../../Services/GlobalDataStore";

const componentLog = "PopupModalHoc";

class PopupModalHoc extends React.Component {
    constructor(props) {
        super(props);
        let isDialog = props.popupConfigs && props.popupConfigs.customDomDialog;
        this.childsRef = React.createRef();
        this.popupHocRoot = document.createElement("DIV");
        this.popupHocRoot.setAttribute("id", "popupHocRoot");
        this.popupHocContainer = document.createElement("DIV");
        if (isDialog) {
            this.popupHocContainer.setAttribute("id", "popupHocContainerDialog");
            let id = this.getDialogId(props);
            if (id) {
                this.popupHocContainer.setAttribute("data-content-id", `${id}`);
            }
        } else {
          this.popupHocContainer.setAttribute("id", "popupHocContainer");
        }
        this.popUpHocOuterLayer = document.createElement("DIV");
        this.popUpHocOuterLayer.setAttribute("id", "popUpHocOuterLayer");
       // this.popupHocRoot.ontouchend = this.outLayerTouched;
        this.mounted = true;

        if (isDialog) {
          if (props.popupConfigs.position === "top") {
              this.popupHocRoot.style.alignItems = "baseline";
              this.popupHocContainer.style.animation = "bounce-down-popup 0.6s forwards";
          } else if (props.popupConfigs.position === "bottom") {
              this.popupHocRoot.style.alignItems = "end";
              this.popupHocContainer.style.animation = "slide-up-popup .6s forwards";
          } else {
               this.popupHocContainer.style.animation = "blow-in-popup 0.6s forwards";
          }
        } else {
            this.popupHocContainer.classList.add('btnMediumEmphasis');
        }
        if (props.popupConfigs && props.popupConfigs.animation) {
            this.popupHocContainer.style.animation = props.popupConfigs.animation;
        }

        this.componentName = "PopupModalHoc";
    }

    componentDidMount = () => {
        document.body.appendChild(this.popupHocRoot);
        this.popupHocRoot.appendChild(this.popupHocContainer);
        this.popupHocRoot.appendChild(this.popUpHocOuterLayer);
        this.updateModelPosition(this.popupHocContainer.clientHeight, this.popupHocContainer.clientWidth);
    }

    componentWillUnmount = () => {
        this.removeModal();
        this.mounted = false;
    }

    getDialogId = (props) => {
        try {

            let findID = (obj) => {
                for (let key in obj) {
                    if (typeof obj[key] === 'object') {
                        if (obj[key] instanceof Array) {
                            for (let i = 0; i < obj[key].length; i++) {
                                if (obj[key][i].id) {
                                    return obj[key][i].id;
                                }
                            }
                        }
                        const id = findID(obj[key]);
                        if (id) {
                            return id;
                        }
                    }
                }
                return null;
            }

            return findID(props.data.dialogData) || null;
        } catch (error) {
            return null;
        }
    }

    updateModelPosition = (clientHeight, clientWidth) => {
        let { popupConfigs: { fullScreen, position, customStyle } = {} } = this.props;
        const parentHeight = document.documentElement.clientHeight;
        const parentWidth = document.documentElement.clientWidth;
        if (fullScreen) {
            this.popupHocContainer.setAttribute("style", "top: 0;width: 100%;height: 100%;bottom: 0;right: 0;left: 0;border-radius: 0;padding: 0;max-width: 100%;");
            return;
        } else if (position === "top") {
            this.popupHocContainer.style.top = "1px";
            this.popupHocContainer.style.bottom = null;
            this.popupHocContainer.style.borderRadius = "0px 0px 20px 20px";
        } else if (position === "bottom") {
            this.popupHocContainer.style.top = null;
            this.popupHocContainer.style.bottom = "0px";
            this.popupHocContainer.style.borderRadius = "20px 20px 0px 0px";
        }
        else {
            const topPos = ((parentHeight - clientHeight) / 2);
            this.popupHocContainer.style.top = topPos < 0 ? "unset" : topPos + "px";
        }
        const leftPos = ((parentWidth - clientWidth) / 2);
        this.popupHocContainer.style.left = leftPos + "px";
        if (customStyle) {
            this.applyCustomStyle(customStyle);
        }
    }

    applyCustomStyle = (customStyle) => {
        Object.keys(customStyle).forEach(key => {
            this.popupHocContainer.style.setProperty(key, customStyle[key], 'important');
        })
    }

    outLayerTouched = (e) => {
        e.stopPropagation();
        let { popupConfigs } = this.props;
        if (popupConfigs && !popupConfigs.cancellable) return;
        if (e.cancelable) {
            e.preventDefault();
        }
        this.close();
    }

    getChildrenWithProps = () => {
        return React.Children.map(this.props.children, child => {
            if (React.isValidElement(child)) {
                return React.cloneElement(child, {
                    closeModal: this.close,
                    data: this.props.data,
                    ref: this.childsRef
                });
            }
            return child;
        });
    }

    close = () => {
        if (this.mounted) {
            this.removeModal();
        }
    };

    removeModal = () => {
        if (this.props.popupConfigs) {
          if  ( this.props.popupConfigs.position === "top") {
            this.popupHocRoot.style.animation = "bounce-up-popup .5s forwards"
          }   if  ( this.props.popupConfigs.position === "top") {
            this.popupHocRoot.style.animation = "bounce-down-popup1 .5s forwards"
          } else if (this.props.popupConfigs.animation === 'none') {
              this.popupHocRoot.style.animation = 'none';
          } else {
               this.popupHocRoot.style.animation = "slide-down-popup 0.5s forwards";
          }
          if (this.props.popupConfigs.enablePDTRonDismiss) {
            window.Android.enablePullToRefresh(true);
          }
        }
        this.popUpHocOuterLayer.style.opacity = "0";
        setTimeout(() => {
            try {
                this.childsRef && this.childsRef.current && this.childsRef.current.onModelClose && this.childsRef.current.onModelClose();
                this.props.onModelClose && this.props.onModelClose();
                if (this.popupHocRoot && document.body.contains(this.popupHocRoot)) {
                    document.body.removeChild(this.popupHocRoot);
                }
            } catch (error) {
                Log.sDebug("Error inside removeModal setTimeout: " + error.message, this.componentName);
            }

            let element = document.getElementById("rootElement");
            if (element) {
                let clientRects = element.getClientRects();
                if (clientRects && clientRects.top < 0) {
                    setTimeout(() => {
                        window.Android.enablePullToRefresh(false);
                    }, 100);
                }
            }
        }, 300);

    }

    render() {
        let ChildWithProps = this.getChildrenWithProps();

        return (
            ReactDOM.createPortal(
                ChildWithProps[0],
                this.popupHocContainer
            )

        )
    }
}

class popupModalHocManger {
    openPopupModalHoc = (Component, data, popupConfigs, onclickEngageCards) => {
        this.div = document.createElement("DIV");
        this.div.className = "dynamic-popup";
        let newModalPopup = (
            <PopupModalHoc data={data} 
                popupConfigs={popupConfigs} 
                onModelClose={this.closeModal}
            >
                <Component onclickEngageCards={onclickEngageCards}/>
            </PopupModalHoc>
        )
        document.body.appendChild(this.div);
        ReactDOM.render(newModalPopup, this.div);
    }

    closeModal = () => {
        try {
            GlobalDataStore.updateData("closeModalCalled", true);
            if (this.div && document.body.contains(this.div)) {
                ReactDOM.unmountComponentAtNode(this.div);
                document.body.removeChild(this.div);
            }
        } catch (error) {
            Log.sDebug("Error occurred in removing 'this.div' node. Retrying: " + error, componentLog, constantObjects.LOG_PROD);
            try {
                let element = document.querySelectorAll(".dynamic-popup");
                if (element) {
                    element.forEach(e => e.remove());
                }
                let hocRoot = document.querySelectorAll('[id="popupHocRoot"]');
                if (hocRoot) {
                    hocRoot.forEach(e => e.remove());
                }
            } catch (err) {
                Log.sDebug("Error occurred in retry closing dilaohHoc: " + error, componentLog, constantObjects.LOG_PROD);
            }
        }
    }
}

PopupModalHoc.propTypes = {
    data: PropTypes.object,
    children: PropTypes.any,
    onModelClose: PropTypes.func,
    popupConfigs: PropTypes.object,
};

const PopupModalHocManger = new popupModalHocManger()
export { PopupModalHocManger };
export default PopupModalHoc;



