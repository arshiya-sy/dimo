import React from "react";
import "../../styles/main.css";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import InputThemes from "../../Themes/inputThemes";

import ClientCreationJson from "../../Services/ClientCreationJson";
import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import MetricServices from "../../Services/MetricsService";
import PageState from "../../Services/PageState";
import PageNames from "../../Services/PageNames";
import arbiApiService from "../../Services/ArbiApiService";
import ArbiResponseHandler, { clientCreationStatus } from '../../Services/ArbiResponseHandler';

import ButtonAppBar from "../CommonUxComponents/ButtonAppBarComponent";
import ProgressBar from "../CommonUxComponents/ProgressBarComponent";
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from "../CommonUxComponents/SecondaryButtonComponent";

import SelectMenuOption from "../CommonUxComponents/SelectMenuOption";
import InformationPage from "../CommonUxComponents/ImageInformationComponent";
import RgFormComponent from "../OnBoardingSupportComponents/RgFormComponent";
import PoliticalComponent from "../OnBoardingSupportComponents/PoliticalComponent";
import DetailFormComponent from "../OnBoardingSupportComponents/DetailFormComponent";
import AddressComponent from "../OnBoardingSupportComponents/AddressComponent";
import AddressCompleteComponent from "../OnBoardingSupportComponents/AddressCompleteComponent";
import ConfirmFormComponent from "../OnBoardingSupportComponents/ConfirmFormComponent";

import FlexView from "react-flexview";
import PropTypes from "prop-types";
import { CSSTransition } from 'react-transition-group';
import Drawer from '@material-ui/core/Drawer';
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import CustomizedProgressBars from "../CommonUxComponents/ProgressComponent";
import RevisionComponent from "./RevisionComponent";
import GeneralUtilities from "../../Services/GeneralUtilities";
import Log from "../../Services/Log";
import constantObjects from "../../Services/Constants";
import UserAddressComponent from "../OnBoardingSupportComponents/UserAddressComponent";
import ImportantDetails from "../NewLaunchComponents/ImportantDetails";
import ArbiErrorResponsehandler from "../../Services/ArbiErrorResponsehandler";

const theme2 = InputThemes.snackBarTheme;
const styles = InputThemes.singleInputStyle;
const PageNameJSON = PageNames.clientCreation;
var localeObj = {};

class ClientCreationComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            direction: "",
            appBarState: this.props.location.state && this.props.location.state.appBarState ? this.props.location.state.appBarState : localeObj.identification,
            creationState: this.props.location.state && this.props.location.state.creationState ? this.props.location.state.creationState : "political",
            rgInfo: this.props.location.state ? this.props.location.state.details : {},
            nextUrl: this.props.location.state && this.props.location.state.nextUrl ? this.props.location.state.nextUrl : "",
            gender: "",
            politicalInfo: {},
            address: this.props.location.state && this.props.location.state.address ? this.props.location.state.address : {},
            cep: "",
            editAddressData: false,
            isAddressincomplete: -1,
            pendencies: [],
            decimal: "",
            step: this.props.location.state && this.props.location.state.step ? this.props.location.state.step : 6,
            open: false,
            snackBarOpen: false,
            selection: false,
            multiSelection: false,
            revSelect: false,
            revision: {},
            passwordData: this.props.location.state? this.props.location.state.passwordData : "",
            cepInfo: this.props.location.state && this.props.location.state.cepInfo ? this.props.location.state.cepInfo : {},
            salary: this.props.location.state && this.props.location.state.salary ? this.props.location.state.salary : -1,
            political: this.props.location.state && this.props.location.state.political ? this.props.location.state.political : "",
            politicalNextDisabled: false
        };
        this.setField = this.setField.bind(this);
        this.setDecimal = this.setDecimal.bind(this);
        this.onBack = this.onBack.bind(this);
        this.onCancel = this.onCancel.bind(this);
        this.saveInfo = this.saveInfo.bind(this);
        this.genderOptions = [];

        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        // this.setState({
        //     appBarState: localeObj.pix_identification
        // })
        this.genderOptions = [localeObj.female, localeObj.male];
        window.onBackPressed = () => {
            if (this.state.open) {
                this.setState({ open: false });
            } else {
                this.onBack();
            }
        }
        if(this.state.creationState === "selfieSuccess"){
            this.saveInfo();
        }
    }

    setDecimal = (field) => {
        this.setState({
            decimal: field,
        })
    }

    setField = (field) => {
        console.log("this.state ", this.state)
        switch (this.state.creationState) {
            case "political":
                const isSwitching = (
                    ((field === "Yes" || field === "Sim") && (this.state.political === "No" || this.state.political === "Não")) ||
                    ((field === "No" || field === "Não") && (this.state.political === "Yes" || this.state.political === "Sim"))
                );
                
                
                this.setState((prevState) => ({
                    creationState: field === "Yes" || field === "Sim" ? "form" : "salary",
                    direction: "left",
                    political: field,
                    salary: isSwitching ? null : prevState.salary, // Clear salary only on switch
                    politicalInfo: isSwitching ? {} : prevState.politicalInfo,
                    step: prevState.step + 1,
                }));
                break;
            case "form":
                return this.setState({
                    creationState: "salary",
                    direction: "left",
                    politicalInfo: field,
                    politicalNextDisabled: field.disabled,
                    step: this.state.step + 1
                })
            case "salary":
                ImportantDetails.onboarding_data.salary = field;
                return this.setState({
                    creationState: "cep",
                    direction: "left",
                    salary: field,
                    appBarState: localeObj.personalInfo,
                    step: this.state.step + 1
                })
            case "cep":
                this.setState({
                    cep: field.cep,
                    cepInfo: field,
                    isAddressincomplete: -1,
                    appBarState: this.state.appBarState
                })
                return this.consultCEP(field);
            case "address_incomplete":
                return this.addAddressDetails(field);
            case "address":
                let parsedSalary = this.extractLowestSalary(this.state.salary);
                arbiApiService.createClientPayloadJson("address", this.state.address);
                arbiApiService.createClientPayloadJson("rendaMensal", parsedSalary);
                if (this.state.political === "Yes" || this.state.political === "Sim") {
                    arbiApiService.createClientPayloadJson("politicallyExposed", this.state.politicalInfo);
                }
                return this.props.history.replace({ pathname :"/identityCreation", from: "client_creation", 
                    state: {
                        creationState : "doc",
                        step: this.state.step + 1,
                        address: this.state.address,
                        cepInfo: this.state.cepInfo,
                        salary: this.state.salary,
                        political: this.state.political,
                        appBarState: this.state.appBarState
                    }
                });
            case "rg":
                this.setState({ rgInfo: field });
                ImportantDetails.onboarding_data.rg = field;
                arbiApiService.createClientPayloadJson("rg", field);
                arbiApiService.createClientPayloadJson("sexo", field.gender);
                this.setState({
                    step: this.state.step + 1
                });
                return this.props.history.replace({
                    pathname: "/newDocUpload",
                    state: { creationState: "selfieCam", rgInfo: field, steps: this.state.step },
                });
            default: break;
        }
    }

    extractLowestSalary = (range) => {
        const lowestSalary = range.match(/R\$ (\d{1,3}(\.\d{3})*,\d{2})/);
        if (lowestSalary) {
            const numericValue = lowestSalary[1].replace(/\./g, '').replace(',', '.');
            return parseFloat(numericValue);
        }
        return 0;
    };

    createRevision = () => {
        let jsonObject = ClientCreationJson;
        let complement = GeneralUtilities.areAllArgsValid(this.state.address["complement"]) ? " " + this.state.address["complement"] : "";
        let street = GeneralUtilities.areAllArgsValid(this.state.address["street"]) ? this.state.address["street"] + ", " : "";
        let neighbourhood = GeneralUtilities.areAllArgsValid(this.state.address["neighbourhood"]) ? "-" + this.state.address["neighbourhood"] : "";
        jsonObject["address"] = street + this.state.address["number"] + complement + neighbourhood
            + "," + this.state.address["city"] + "-" + this.state.address["uf"] + " "
            + localeObj.cep + " - " + this.state.address["cep"];
        return this.setState({
            creationState: "revision",
            appBarState: localeObj.revision,
            revision: jsonObject,
            direction: "left",
            step: this.state.step + 1
        })
    }

    consultCEP = (jsonObject) => {
        if (GeneralUtilities.emptyValueCheck(jsonObject.neighborhood) || GeneralUtilities.emptyValueCheck(jsonObject.street)) {
            if (GeneralUtilities.emptyValueCheck(jsonObject.neighborhood) && GeneralUtilities.emptyValueCheck(jsonObject.street)) {
                this.setState({
                    isAddressincomplete: 2
                });
            } else if (GeneralUtilities.emptyValueCheck(jsonObject.neighborhood)) {
                this.setState({
                    isAddressincomplete: 1
                });
            } else if (GeneralUtilities.emptyValueCheck(jsonObject.street)) {
                this.setState({
                    isAddressincomplete: 0
                });
            }
            this.setState({
                creationState: "cep",
                direction: "left",
                address: jsonObject,
                complement: jsonObject.complement,
                step: this.state.step + 1
            })
        } else {
            this.setState({
                creationState: "address",
                direction: "left",
                address: jsonObject,
                complement: jsonObject.complement,
                step: this.state.step + 1
            })
        }
    }

    addAddressDetails = (field) => {
        switch (this.state.isAddressincomplete) {
            case 0:
                this.setState(prevState => ({
                    address: {
                        ...prevState.address,
                        street: field.street,
                    }
                }))
                break;
            case 1:
                this.setState(prevState => ({
                    address: {
                        ...prevState.address,
                        neighbourhood: field.neighbourhood
                    }
                }))
                break;
            case 2:
                this.setState(prevState => ({
                    address: {
                        ...prevState.address,
                        street: field.street,
                        complement: field.neighbourhood
                    }
                }))
                break;
            default: break;
        }
        this.setState({
            creationState: "address",
            direction: "left",
            step: this.state.step + 1
        })
    }

    saveInfo = async () => {
        this.showProgressDialog();
        arbiApiService.initializeClientCreation();
        let payloadForMetrics = {
            "birthday": ImportantDetails.onboarding_data.rg.dob,
            "gender": ImportantDetails.onboarding_data.rg.gender,
            "salary": ImportantDetails.onboarding_data.salary
        }
        await arbiApiService.createNewClient(PageNameJSON.revision).then(response => {
            if (response.success) {
                let processorResponse = ArbiResponseHandler.processCreateClientResponse(response.result, payloadForMetrics);
                if (processorResponse.success) {
                    this.verifyStatus();
                } else {
                    this.hideProgressDialog();
                    this.setState({ creationState: "rg"})
                    this.openSnackBar(localeObj.verify_again);
                    return
                }
            } else {
                this.hideProgressDialog();
                this.openSnackBar(response.result.message)
                this.setState({
                    message: response.result.message,
                    creationState: "rg"
                 });
                return;
            }
        });
     }

    async onSubmit() {
        this.props.history.replace("/waitingApproval");
    }

    verifyStatus = () => {
        arbiApiService.getClientStatus(PageNameJSON.revision).then(response => {
            if (response.success) {
                let processorResponse = ArbiResponseHandler.processGetStatusResponse(response.result);
                if (processorResponse.success) {
                    this.hideProgressDialog();
                    this.onSubmit();
                } else {
                    this.hideProgressDialog();
                    this.setState({ creationState: "rg"})
                    this.openSnackBar(localeObj.tryAgainLater);
                }
            } else {
                this.hideProgressDialog();
                this.setState({ creationState: "rg"})
                this.openSnackBar(localeObj.tryAgainLater);
                return;
            }
        });
    }

    onBack = () => {
        if (this.state.processing) {
            return this.setState({
                snackBarOpen: true,
                message: localeObj.no_action
            })
        } else {
            let pageNameforBackKey = PageNameJSON[this.state.creationState];
            if (this.state.creationState === "cep" && this.state.editAddressData) {
                pageNameforBackKey = PageNameJSON["address_edit"];
                this.setState({
                    editAddressData: false,
                    isAddressincomplete: -1
                })
            }

            MetricServices.onPageTransitionStop(pageNameforBackKey, PageState.back);
            switch (this.state.creationState) {
                case "rg":
                    if (!this.state.selection) {
                        this.setState({ open : true })
                    } else {
                        this.setState({ selection: false })
                    }
                    break;
                case "political":
                    this.setState({ open : true});
                    break;
                case "form":
                    if (!this.state.multiSelection) {
                        return this.setState({
                            creationState: "political",
                            step: this.state.step - 1,
                            direction: "right"
                        })
                    } else {
                        this.setState({
                            multiSelection: false
                        })
                    }
                    break;
                case "salary":
                    if (this.state.political === "Yes" || this.state.political === "Sim") {
                        return this.setState({
                            creationState: "form",
                            step: this.state.step - 1,
                            direction: "right",
                            appBarState: localeObj.pix_identification
                        })
                    } else {
                        return this.setState({
                            creationState: "political",
                            step: this.state.step - 1,
                            direction: "right",
                            appBarState: localeObj.pix_identification
                        })
                    }
                case "cep":
                    return this.setState({
                        creationState: "salary",
                        step: this.state.step - 1,
                        direction: "right",
                        isAddressincomplete: -1,
                        appBarState: localeObj.pix_identification
                    })
                case "address_incomplete":
                    return this.setState({
                        creationState: "cep",
                        step: this.state.step - 1,
                        direction: "right"
                    })
                case "address":
                    if (this.state.isAddressincomplete === -1) {
                        return this.setState({
                            creationState: "cep",
                            step: this.state.step - 1,
                            direction: "right"
                        })
                    } else if (this.state.isAddressincomplete > -1 && this.state.isAddressincomplete < 3) {
                        return this.setState({
                            creationState: "address_incomplete",
                            step: this.state.step - 1,
                            direction: "right"
                        })
                    }
                    break;
                default: break;
            }
        }
    }

    onCancel = () => {
        this.setState({ open: true })
    }

    onSecondary = () => {
        let pageNameforCancel = PageNameJSON[this.state.creationState];
        if (this.state.creationState === "cep" && this.state.editAddressData) {
            pageNameforCancel = PageNameJSON["address_edit"];
            this.setState({
                editAddressData: false
            })
        }
        MetricServices.onPageTransitionStop(pageNameforCancel, PageState.cancel);
        this.setState({ open: false })
        this.props.history.replace({ pathname: "/", transition: "right" });
    }

    onPrimary = () => {
        this.setState({ open: false })
    }

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
    }

    openSnackBar = (message) => {
        this.setState({
            snackBarOpen: true,
            message: message
        })
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

    multipleSelection = (field) => {
        this.setState({
            selection: field
        })
    }

    multipleCheckSelection = (field) => {
        this.setState({
            multiSelection: field
        })
    }

    revSelectionDone = (field) => {
        this.setState({
            revSelect: field
        })
    }

    editAddress = () => {
        let currentAddressState = this.state.isAddressincomplete;
        return this.setState({
            creationState: "cep",
            appBarState: localeObj.pix_identification,
            editAddressData: true,
            direction: "right",
            step: currentAddressState > -1 ? this.state.step - 4 : this.state.step - 3,
            isAddressincomplete: -1
        })
    }

    getOnboardingTerms = async (val) => {
        let termos = [];
        await arbiApiService.getTerms().then((response) => {
          Log.sDebug("getTerms:" + JSON.stringify(response));
          if (response.success) {
            termos = response.result.termos;
            if(val === "address"){
              androidApiCalls.openUrlInBrowser(termos[0].linkTermo);
            }
          }
        });
    };
    
    read = (val) => {
        this.getOnboardingTerms(val);
    };

    render() {
        const { classes } = this.props;
        const creation = this.state.creationState;
        const steps = this.state.step;
        return (
            <div style={{ overflowX: "hidden" }}>
                <ButtonAppBar header={this.state.appBarState} onBack={this.onBack} onCancel={this.onCancel} action="cancel" />
                <ProgressBar incrementMaxSteps={this.state.isAddressincomplete > -1 ? true : false} size={steps} />
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "political" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "political" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "political" && <SelectMenuOption type="Political" header={localeObj.political_header} description={localeObj.political_descriptor}
                            recieveField={this.setField} value={this.state.political} componentName={PageNameJSON.political} footNote={localeObj.political_info_footNote}/>}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "form" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "form" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "form" && <PoliticalComponent recieveField={this.setField} value={this.state.politicalInfo} politicalNextDisabled={this.state.politicalNextDisabled} componentName={PageNameJSON.form}
                            multiSelection={this.state.multiSelection} multipleSelection={this.multipleCheckSelection} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "salary" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "salary" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "salary" && <SelectMenuOption type="salary" header={localeObj.salary_header} description={localeObj.salary_descriptor}
                            recieveField={this.setField} value={this.state.salary} componentName={PageNameJSON.salary}/>}
                    </div>
                        {/* <ConfirmFormComponent field={localeObj.salary} header={localeObj.salary_header} value={this.state.salary} decimal={this.state.decimal}
                            description={localeObj.salary_descriptor} recieveField={this.setField} type="tel" btnText={localeObj.next} recieveDecimal={this.setDecimal}
                            componentName={PageNameJSON.salary} />}
                    </div> */}
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "cep" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "cep" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "cep" && <UserAddressComponent 
                            recieveField={this.setField} type="tel" btnText={localeObj.next} value={this.state.cepInfo}
                            componentName={PageNameJSON.cep} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "address" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "address" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "address" && <AddressComponent address={this.state.address} recieveField={this.setField} reset={this.onBack} read={this.read} componentName={PageNameJSON.address} />}
                    </div>
                </CSSTransition>
                {/* <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "cep" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "cep" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "cep" && <DetailFormComponent header={localeObj.cep_header} field={localeObj.cep} recieveField={this.setField} type="tel"
                            value={this.state.cep} componentName={this.state.editAddressData ? PageNameJSON.address_edit : PageNameJSON.cep} />}
                    </div>
                </CSSTransition> */}
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "rg" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "rg" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "rg" && <RgFormComponent recieveField={this.setField} value={this.state.rgInfo} selection={this.state.selection} multipleSelection={this.multipleSelection}
                            componentName={PageNameJSON.rg} parentOnBack={this.onBack} />}
                    </div>
                </CSSTransition>
                {/* <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "gender" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "gender" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "gender" && <SelectMenuOption type="Gender" header={localeObj.gender_header} description={localeObj.gender_descriptor}
                            recieveField={this.setField} value={this.state.genderOpt} componentName={PageNameJSON.gender} />}
                    </div>
                </CSSTransition> */}
                {/* <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "address_incomplete" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "address_incomplete" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "address_incomplete" && <AddressCompleteComponent header={localeObj.cep_header} address={this.state.address} showFields={this.state.isAddressincomplete} recieveField={this.setField}
                            componentName={PageNameJSON.address_incomplete} />}
                    </div>
                </CSSTransition> */}
                {/* <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "addNum" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "addNum" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "addNum" && <DetailFormComponent header={localeObj.address} field={localeObj.add_num} recieveField={this.setField} type="tel"
                            value={this.state.addNum} componentName={PageNameJSON.addNum} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "complement" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "complement" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "complement" && <DetailFormComponent header={localeObj.comp_header} field={localeObj.add_comp} recieveField={this.setField}
                            value={this.state.complement} componentName={PageNameJSON.complement} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "revision" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "revision" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "revision" && <RevisionComponent profileData={this.state.revision} revSelect={this.state.revSelect}
                            editAddress={this.editAddress} recieveField={this.setField} revSelectionDone={this.revSelectionDone} componentName={PageNameJSON.revision} />}
                    </div>
                </CSSTransition> */}

                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing && <CustomizedProgressBars />}
                </div>
                <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
                    <MuiThemeProvider theme={InputThemes.OperatorMenuTheme}>
                        <Drawer classes={{ paper: classes.paper }}
                            anchor="bottom"
                            open={this.state.open}>
                            <div style={{ margin: "1.5rem" }}>
                                <FlexView column style={{ marginTop: "0.5rem" }}>
                                    <div className="H6 highEmphasis" style={{ textAlign: "center" }}>
                                        {localeObj.cancel_message_header}
                                    </div>
                                    <div className="Body2 mediumEmphasis" style={{ textAlign: "center", marginTop: "1rem" }}>
                                        {localeObj.cancel_message_description}
                                    </div>
                                </FlexView>
                            </div>
                            <div style={{ width: "100%", marginBottom: "1.5rem", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
                                <PrimaryButtonComponent btn_text={localeObj.resume} onCheck={this.onPrimary} />
                                <SecondaryButtonComponent btn_text={localeObj.stop} onCheck={this.onSecondary} />
                            </div>
                        </Drawer>
                    </MuiThemeProvider>
                </div>
                <MuiThemeProvider theme={theme2}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
            </div >
        );
    }
}

ClientCreationComponent.propTypes = {
    classes: PropTypes.object.isRequired,
    location: PropTypes.object,
    history: PropTypes.object
};

export default withStyles(styles)(ClientCreationComponent);
