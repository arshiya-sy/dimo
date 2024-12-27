import React from "react";
import FlexView from "react-flexview";
import PropTypes from 'prop-types';

import "../../styles/main.css";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import ColorPicker from "../../Services/ColorPicker";
import InputThemes from "../../Themes/inputThemes";

import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";

import InputAdornment from "@material-ui/core/InputAdornment";
import TextField from "@material-ui/core/TextField";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Search from "@material-ui/icons/SearchOutlined";
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";
import ArrowIcon from '@material-ui/icons/ArrowForwardIos';
import CustomizedProgressBars from "./ProgressComponent";
import Log from "../../Services/Log";

const theme1 = InputThemes.SearchInputTheme;
const styles = InputThemes.multipleInputStyle;
var localeObj = {};

class LongList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            menuOptions: [],
            allOptions: [],
            snackBarOpen: false,
            cleared: false,
            value: props.value || ""
        }
        this.issuingOrganizations = ["DETRAN", "SESP", "SSP", "Outros", "RCPN", "DPF", "ABNC", "DUREX", "CGPI", "CGPMAF",
            "CNIG", "CNT", "COREN", "CORECON", "CRA", "CRAS", "CRB", "CRC", "CRE", "CREA",
            "CRECI", "CREFIT", "CRESS", "CRF", "CRM", "CRN", "CRO", "CRP", "CRPRE", "CRQ",
            "RRC", "CRMV", "CSC", "CTPS", "DIC", "DIREX", "DPMAF", "DPT", "DST", "FGTS",
            "FIPE", "FLS", "GOVGO", "ICLA", "IFP", "IGP", "IICCECFRO", "IIMG", "IML",
            "IPC", "IPF", "MAE", "MEX", "MMA", "OAB", "OMB", "PCMG", "PMMG", "POF", "POM",
            "SDS", "SNJ", "SECC", "SEJUSP", "SES", "EST", "SJS", "SJTC", "SJTS", "SPTC"]

        this.states = ["AC - Acre", "AL - Alagoas", "AP - Amapá", "AM - Amazonas", "BA - Bahia", "CE - Ceará", "DF - Distrito Federal",
            "ES - Espírito Santo", "GO - Goiás", "MA - Maranhão", "MT - Mato Grosso", "MS - Mato Grosso do Sul", "MG - Minas Gerais",
            "PA - Pará", "PB - Paraíba", "PR - Paraná", "PE - Pernambuco", "PI - Piauí", "RJ - Rio de Janeiro", "RN - Rio Grande do Norte",
            "RS - Rio Grande do Sul", "RO - Rondônia", "RR - Roraima", "SC - Santa Catarina", "SP - São Paulo", "SE - Sergipe", "TO - Tocantins"];

        this.handleClick = this.handleClick.bind(this);
        this.handleChange = this.handleChange.bind(this);

        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        let categoryList = [
            localeObj.category_general,
            localeObj.pix_header,
            localeObj.transfer_money,
            localeObj.total,
            localeObj.category_pay_qr,
            localeObj.category_pay_bar,
            localeObj.category_pay_gen,
            localeObj.category_statement,
            localeObj.category_atm_card,
            localeObj.category_atm_qr,
            localeObj.category_card,
            localeObj.phone_recharge,
            localeObj.category_recieve,
            localeObj.help_txt,
            localeObj.chatbot_feedback_menu,
            localeObj.dimo_rewards,
            localeObj.category_others
        ]
        switch (this.props.type) {
            case "State":
                this.setState({
                    menuOptions: this.states,
                    allOptions: this.states,
                })
                break;
            case "Body":
                this.setState({
                    menuOptions: this.issuingOrganizations,
                    allOptions: this.issuingOrganizations
                })
                break;
            case "category":
                this.setState({
                    menuOptions: categoryList,
                    allOptions: categoryList
                })
                break;
            default:
        }
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

    handleChange = (event) => {
        this.setState({
            menuOptions: this.state.allOptions.filter((option) =>
                option.toLowerCase().includes(event.target.value.toLowerCase())
            ),
        });
        this.setState({ value: event.target.value });
    };

    handleClick = (option) => {
        switch (this.props.type) {
            case "State":
                this.props.confirm(option.split(" - ")[0]);
                Log.debug(option.split(" - ")[0])
                break;
            case "Body":
                this.props.confirm(option);
                break;
            case "category":
                this.props.confirm(option);
                break;
            default:
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
                        {this.props.type !== "category" &&
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
                        }
                        <div style={{ margin: "1.5rem", marginBottom: "0" }}>
                            <div className={this.props.type !== "category" ? "scroll" : ""} style={{ overflowY: "auto", height: this.props.type !== "category" ? `${screenHeight - 340}px` : `${screenHeight - 290}px`, overflowX: "hidden" }}>
                                {
                                    this.state.menuOptions.map((opt, key) => (
                                        <ListItem key={key} button onClick={() => this.handleClick(opt)}>
                                            <ListItemText className="body2 highEmphasis" primary={this.props.type === "category" ? (key + 1) + " - " + opt : opt} />
                                            <ArrowIcon style={{ fill: ColorPicker.accent, marginRight: "1rem", fontSize: "1rem" }} />
                                        </ListItem>
                                    ))
                                }
                            </div>
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

LongList.propTypes = {
    type: PropTypes.oneOf(['State', 'Body', 'category']),
    confirm: PropTypes.func,
    header: PropTypes.string,
    value: PropTypes.string,
    classes: PropTypes.object
  };

export default withStyles(styles)(LongList);
