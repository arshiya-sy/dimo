import React from "react";
import FlexView from "react-flexview";

import "../../../styles/main.css";
import "../../../styles/genericFontStyles.css";
import "../../../styles/colorSelect.css";

import localeService from "../../../Services/localeListService";
import androidApiCalls from "../../../Services/androidApiCallsService";
import ArbiApiService from "../../../Services/ArbiApiService";
import ArbiResponseHandler from '../../../Services/ArbiResponseHandler';
import ColorPicker from "../../../Services/ColorPicker";
import MetricServices from "../../../Services/MetricsService";
import PageState from '../../../Services/PageState';

import Button from '@material-ui/core/Button';
import InputAdornment from "@material-ui/core/InputAdornment";
import TextField from "@material-ui/core/TextField";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Search from "@material-ui/icons/SearchOutlined";
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";
import ArrowIcon from '@material-ui/icons/ArrowForwardIos';

import CustomizedProgressBars from "../../CommonUxComponents/ProgressComponent";
import Empty from "../../../images/OnBoardingImages/Empty state.png";
import InputThemes from "../../../Themes/inputThemes";
import PropTypes from 'prop-types';

const theme1 = InputThemes.SearchInputTheme;
const styles = InputThemes.multipleInputStyle;
var localeObj = {};

const CreateButton = withStyles(() => ({
    root: {
        color: ColorPicker.darkHighEmphasis,
        borderRadius: "10px",
        fontSize: "0.875rem",
        fontWeight: "400",
        lineHeight: "30px",
        padding: "16px 24px",
        textTransform: 'none',
        textAlign: 'center',
        boxShadow: "none",
        justifyContent: "center",
        border: "1px solid " + ColorPicker.buttonAccent,
        minWidth: "20rem",
        '&:hover': {
            border: "solid 1px " + ColorPicker.buttonAccent,
            boxShadow: "none",
        },
        '&:disabled': {
            color: ColorPicker.disabledTxt,
            backgroundColor: ColorPicker.secDisabled,
        },
        "& .MuiTouchRipple-root span": {
            border: "solid 1px " + + ColorPicker.buttonAccent,
            boxShadow: "none",
        },
    },
}))(Button);

class ListAllContacts extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            contacts: [],
            allContacts: [],
            snackBarOpen: false,
            cleared: false,
            empty: true
        }
        this.handleClick = this.handleClick.bind(this);
        this.handleChange = this.handleChange.bind(this);
        if(this.props.componentName) {
            this.componentName = this.props.componentName;
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(this.componentName);
    }

    componentDidMount() {
        document.addEventListener("visibilitychange", this.visibilityChange);
        androidApiCalls.enablePullToRefresh(false);
        this.fetchContactDetails("");
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

    fetchContactDetails = (filter) => {
        this.showProgressDialog();
        ArbiApiService.fetchAllFavorites(filter, this.componentName).then(response => {
            if (response.success) {
                this.hideProgressDialog();
                let processedResponse = ArbiResponseHandler.processFetchingAllContacts(response.result);
                if (processedResponse.success) {
                    if (processedResponse.contacts.length === 0) {
                        this.setState({
                            empty: true
                        })
                    } else {
                        this.setState({
                            empty: false,
                            contacts: processedResponse.contacts,
                            allContacts: processedResponse.contacts
                        })
                    }
                }
            } else {
                this.setState({
                    empty: true
                })
                this.hideProgressDialog();
            }
        });
    }

    handleChange = (event) => {
        this.setState({
            contacts: this.state.allContacts.filter((option) =>
                option.apelido.toLowerCase().includes(event.target.value.toLowerCase())
            ),
        });
        this.setState({ value: event.target.value });
    };

    handleClick = (option) => {
        let jsonObject = {};
        jsonObject["favId"] = option.favoritoId;
        jsonObject["cpf"] = option.identificacaoFiscal;
        jsonObject["nickName"] = option.apelido;
        jsonObject["fullName"] = option.nomeCompleto;
        jsonObject["saveCreateNew"] = false
        MetricServices.onPageTransitionStop(this.componentName, PageState.close);
        this.props.confirm(jsonObject);
    };

    createNewContact = () => {
        let jsonObject = {};
        jsonObject["saveCreateNew"] = true;
        MetricServices.onPageTransitionStop(this.componentName, PageState.close);
        this.props.confirm(jsonObject);
    }

    addContact = () => {
        MetricServices.onPageTransitionStop(this.componentName, PageState.close);
        this.props.add();
    }

    render() {
        const screenHeight = window.screen.height;
        const { classes } = this.props;
        return (
            <div>
                <div style={{ display: !this.state.processing ? 'block' : 'none' }}>
                    <div style={InputThemes.initialMarginStyle}>
                    <div style={{ display:this.props.showAddNewOption ? "flex": "none", width: "100%", marginBottom: "1.5rem", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
                        <CreateButton onClick={this.createNewContact} >{localeObj.contact_create_new}</CreateButton>
                    </div>
                        <FlexView column>
                            <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                                {this.props.showAddNewOption ? localeObj.contact_add_to_existing : localeObj.contact_header}
                            </div>
                        </FlexView>
                    </div>
                    <MuiThemeProvider theme={InputThemes.SearchInputTheme}>
                        <List dense={false}>
                            <div style={{ display: (this.props.showAddOption ? 'block' : 'none'), margin: "0 1.5rem", marginBottom: "1rem" }}>
                                <ListItem button onClick={() => this.addContact()}>
                                    <ListItemText className="body2 highEmphasis" primary={localeObj.add_new_contact} />
                                    <ArrowIcon style={{ fill: ColorPicker.accent, marginRight: "1rem", fontSize: "1rem" }} />
                                </ListItem>
                            </div>
                        </List>
                    </MuiThemeProvider>
                    <MuiThemeProvider theme={theme1}>
                        <TextField value={this.state.value}
                            placeholder={localeObj.search_contact}
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
                        {!this.state.empty &&
                            <div style={{ margin: "1.5rem", overflowY: "auto", height: `${screenHeight - 390}px`, overflowX: "hidden" }}>
                                {
                                    this.state.contacts.map((opt, key) => (
                                        <ListItem key={key} button onClick={() => this.handleClick(opt)}>
                                            <ListItemText className="body2 highEmphasis" primary={opt.apelido} />
                                            <ArrowIcon style={{ fill: ColorPicker.accent, marginRight: "1rem", fontSize: "1rem" }} />
                                        </ListItem>
                                    ))
                                }
                            </div>
                        }
                    </MuiThemeProvider>
                    {this.state.empty &&
                        <FlexView column>
                            <div  style={{ marginTop: "7.75rem", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
                                <span>
                                    <img style={{ width: '6rem', height: "6rem" }} src={Empty} alt="" />
                                </span>
                            </div>
                            <div className="body1 highEmphasis" style={{ margin: "1.5rem", textAlign: "center" }} >
                                {localeObj.no_contacts}
                            </div>
                        </FlexView>
                    }
                </div>
                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing && <CustomizedProgressBars />}
                </div>
            </div >
        );
    }
}
ListAllContacts.propTypes = {
    classes: PropTypes.object.isRequired,
    showAddOption: PropTypes.bool,
    showAddNewOption: PropTypes.bool,
    componentName: PropTypes.string,
    confirm: PropTypes.func,
    add: PropTypes.func
  };

export default withStyles(styles)(ListAllContacts);