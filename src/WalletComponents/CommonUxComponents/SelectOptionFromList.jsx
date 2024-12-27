import React from "react";
import FlexView from "react-flexview";
import PropTypes from 'prop-types';

import "../../styles/main.css";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import ColorPicker from "../../Services/ColorPicker";
import InputThemes from "../../Themes/inputThemes";

import utilities from "../../Services/NewUtilities";
import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import ArbiApiService from "../../Services/ArbiApiService";
import ArbiResponseHandler from '../../Services/ArbiResponseHandler';

import InputAdornment from "@material-ui/core/InputAdornment";
import TextField from "@material-ui/core/TextField";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Search from "@material-ui/icons/SearchOutlined";
import ArrowForwardIosIcon from "@material-ui/icons/ArrowForwardIos";
import MetricServices from "../../Services/MetricsService";
import PageState from '../../Services/PageState';
import { MuiThemeProvider, withStyles  } from "@material-ui/core/styles";
import CustomizedProgressBars from "./ProgressComponent";

const theme1 = InputThemes.SearchInputTheme;
const styles = InputThemes.multipleInputStyle;
var localeObj = {};

class SelectOption extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            menuOptions: [],
            bankOptions: [],
            codeOptions: [],
            ispbOptions: [],
            contactsName: [],
            contactsNumber: [],
            completePhoneNumberEditList: [],
            snackBarOpen: false,
            cleared: false,
            value: props.value || "",
            searchList: []
        }

        this.style = {
            iconStyle: {
                color: ColorPicker.accent,
                fontSize: "1rem"
            }
        }

        this.handleClick = this.handleClick.bind(this);
        this.handleChange = this.handleChange.bind(this);

        if (this.props.componentName) {
            this.componentName = this.props.componentName;
        } else {
            this.componentName = "BANK SELECTION";
        }

        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(this.componentName);
    }

    componentDidMount() {
        document.addEventListener("visibilitychange", this.visibilityChange);
        androidApiCalls.enablePullToRefresh(false);
        let phoneNumberObj = [];
        let numberList = this.props.contactList;
        let displayArray;
        let allContacts = [];
        switch (this.props.type) {
            case "Bank":
                this.showProgressDialog();
                this.fetchBankDetails("Ban");
                break;
            case "Recharge":
                for (let value of numberList) {
                    let phoneNumObj = utilities.parsePhoneNum(value);
                    phoneNumberObj.push({
                        ddd: phoneNumObj.phoneNumber.replace(/[^0-9]/g, '').substr(0, 2),
                        phoneNumber: phoneNumObj.phoneNumber.replace(/[^0-9]/g, '').substr(2, 11),
                        displayNumber: phoneNumObj.phoneNumber
                    })
                }
                displayArray = phoneNumberObj.map(values => values.displayNumber);
                for (let i = 0; i < this.props.contactName.length; i++) {
                    allContacts.push({ name: this.props.contactName[i], number: displayArray[i] });
                  }

                this.setState({
                    contactsName: this.props.contactName,
                    searchList: allContacts,
                    contactsNumber: displayArray,
                    completePhoneNumberEditList: phoneNumberObj
                })
                break;
            default:
        }
    }

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricServices.onPageTransitionStop(this.componentName, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricServices.onPageTransitionStart(this.componentName);
        }
    }

    componentWillUnmount() {
        document.removeEventListener("visibilitychange", this.visibilityChange);
    }

    showProgressDialog = () => {
        this.setState({
            processing: true
        })
    }

    hideProgressDialog = () => {
        this.setState({
            processing: false
        })
    }

    fetchBankDetails = (filter) => {
        ArbiApiService.getBankList(filter).then(response => {
            if (response.success) {
                this.hideProgressDialog();
                let processedResponse = {};
                if(this.props.TEDBankList && this.props.TEDBankList === true){
                    processedResponse = ArbiResponseHandler.processTEDBankDetails(response.result);
                } else {
                    processedResponse = ArbiResponseHandler.processBankDetails(response.result);
                }
                if (processedResponse.success) {
                    this.setState({
                        bankOptions: processedResponse.bankOptions,
                        codeOptions: processedResponse.codeOptions,
                        menuOptions: processedResponse.bankOptions,
                        ispbOptions: processedResponse.ispbOptions,
                    })
                    if (filter === "Ban") {
                        this.setState({ cleared: false });
                    } else {
                        this.setState({ cleared: true });
                    }
                }
            } else {
                let jsonObj = {};
                this.hideProgressDialog();
                if (response.result === !response.status || (response.status >= 400 && response.status < 500)) {
                    jsonObj["error"] = true;
                    jsonObj["errorCode"] = response.status;
                    jsonObj["reason"] = "communication_issue"
                    MetricServices.onPageTransitionStop(this.componentName, PageState.error);
                    this.props.confirm(jsonObj);
                } else {
                    jsonObj["error"] = true;
                    jsonObj["errorCode"] = response.status;
                    jsonObj["reason"] = response.status !== 504 ? "technical_issue" : "time_limit_exceeded"
                    MetricServices.onPageTransitionStop(this.componentName, PageState.error);
                    this.props.confirm(jsonObj);
                }
            }
        });
    }

    handleChange = (event) => {
        if (this.props.type === "Bank") {
            if (event.target.value.toString().length === 3) {
                this.fetchBankDetails(event.target.value);
            } else if (event.target.value.toString().length === 2 && this.state.cleared) {
                this.fetchBankDetails("Ban");
            } else {
                this.setState({
                    menuOptions: this.state.bankOptions.filter((option) =>
                        option.toLowerCase().includes(event.target.value.toLowerCase())
                    ),
                });
            }
        } else if (this.props.type === "Recharge") {
            this.setState({
                // searchList: this.props.contactList.filter((contact) =>
                //     contact.toLowerCase().includes(event.target.value.toLowerCase())
                // )
                // // searchList:this.state.contactsName.filter((name, index) => this.state.contactsNumber[index].toLowerCase().includes(event.target.value.toLowerCase())),

                searchList: this.state.contactsName.reduce((filteredContacts, name, index) => {
                    if (
                      name.toLowerCase().includes(event.target.value.toLowerCase()) ||
                      this.state.contactsNumber[index].includes(event.target.value)
                    ) {
                      filteredContacts.push({ name, number: this.state.contactsNumber[index] });
                    }
                    return filteredContacts;
                  }, []),
            });


        } else {
            this.setState({
                menuOptions: this.state.bankOptions.filter((option) =>
                    option.toLowerCase().includes(event.target.value.toLowerCase())
                ),
            });
        }
        this.setState({ value: event.target.value });


    };

    handleClick = (option, index) => {
        MetricServices.onPageTransitionStop(this.componentName, PageState.close);
        if (this.props.type === "Bank") {
            let jsonObject = {};
            jsonObject["receiverInstitute"] = option;
            jsonObject["code"] = this.state.codeOptions[this.state.bankOptions.findIndex(item => item === option)];
            jsonObject["receiverIspb"] = this.state.ispbOptions[this.state.bankOptions.findIndex(item => item === option)];
            this.props.confirm(jsonObject);
        } else if (this.props.type === "Recharge") {
            let selectedContactNumber = this.state.completePhoneNumberEditList[index]
            this.props.confirm(selectedContactNumber);
        } else {
            this.props.confirm(option);
        }
    };

    render() {
        const screenHeight = window.screen.height;
        const { classes } = this.props;
        return (
            <div>
                <div style={{ display: !this.state.processing ? 'block' : 'none' }}>
                    <div style={InputThemes.initialMarginStyle}>
                        <FlexView column>
                            <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                                {this.props.header}
                            </div>
                        </FlexView>
                    </div>
                    <MuiThemeProvider theme={theme1}>
                        <TextField value={this.state.value}
                            placeholder={localeObj.search}
                            onChange={this.handleChange}
                            id="input-with-icon-textfield"
                            InputProps={{
                                classes: { underline: classes.underline },
                                className: this.state.value === "" ? classes.input : classes.finalInput,
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search style={{ fill: ColorPicker.darkHighEmphasis }} />
                                    </InputAdornment>
                                )
                            }} />
                        <div style={{ margin: "1.5rem", overflowY: "auto", height: `${screenHeight * 0.6}px`, overflowX: "hidden" }}>
                            {this.props.type && this.props.type === "Bank" &&
                                this.state.menuOptions.map((opt, key) => (
                                    <ListItem key={key} button onClick={() => this.handleClick(opt)}>
                                        <ListItemText className="body2 highEmphasis" primary={this.state.codeOptions[this.state.bankOptions.findIndex(item => item === opt)] + " - " + opt} />
                                    </ListItem>
                                ))
                            }
                            {this.props.type && this.props.type === "Recharge" &&
                                this.state.searchList.map((opt, index) => (
                                    <ListItem key={index} button onClick={() => this.handleClick(opt, index)}>
                                        <ListItemText className="body2 highEmphasis" primary={opt.name} secondary={opt.number} />
                                        {/* <ListItemText className="body2 highEmphasis" primary={opt} secondary={this.state.contactsNumber[this.state.contactsName.findIndex(item => item === opt)]} /> */}
                                        <span style={{ marginRight: "2%" }}>
                                            <ArrowForwardIosIcon style={this.style.iconStyle} />
                                        </span>
                                    </ListItem>
                                ))
                            }
                        </div>
                    </MuiThemeProvider>
                </div>
                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing && <CustomizedProgressBars />}
                </div>
            </div >
        );
    }
}

SelectOption.propTypes = {
    componentName: PropTypes.string,
    header: PropTypes.string,
    classes: PropTypes.object,
    TEDBankList: PropTypes.bool,
    type: PropTypes.oneOf(['Bank', 'Recharge']),
    contactList: PropTypes.arrayOf(PropTypes.string),
    contactName: PropTypes.arrayOf(PropTypes.string),
    confirm: PropTypes.func,
    value: PropTypes.string,
  };
export default withStyles(styles)(SelectOption);