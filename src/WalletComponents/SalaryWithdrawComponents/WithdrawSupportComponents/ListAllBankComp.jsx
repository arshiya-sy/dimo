import React from "react";
import FlexView from "react-flexview";
import PropTypes from "prop-types";
import "../../../styles/main.css";
import "../../../styles/genericFontStyles.css";
import "../../../styles/colorSelect.css";
import ColorPicker from "../../../Services/ColorPicker";
import InputThemes from "../../../Themes/inputThemes";

import localeService from "../../../Services/localeListService";
import androidApiCalls from "../../../Services/androidApiCallsService";

import InputAdornment from "@material-ui/core/InputAdornment";
import TextField from "@material-ui/core/TextField";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Search from "@material-ui/icons/SearchOutlined";
import MetricServices from "../../../Services/MetricsService";
import PageState from '../../../Services/PageState';
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";
import CustomizedProgressBars from "../../CommonUxComponents/ProgressComponent";

const theme1 = InputThemes.SearchInputTheme;
const styles = InputThemes.multipleInputStyle;
var localeObj = {};

const bankNames = ["Acesso Soluções de Pagamentos S.A", "AL5 S.A Crédito, Financiamento e Investimento", "Banco Agibank S.A.", "Banco Arbi S.A", "Banco BMG S.A", "Banco Bradesco S.A.", "Banco BS2 S.A.", "Banco BTG Pactual S.A.",
    "Banco BV S/A", "Banco C6 S.A", "Banco Cooperativo do Brasil S.A.", "Banco Cooperativo SICREDI S.A.", "Banco Crefisa S.A.", "Banco da Amazônia S.A.", "Banco de Brasilia S.A - BRB", "Banco Digio S.A", "Banco do Brasil S.A.",
    "Banco do Estado de Sergipe", "Banco do Estado do Espírito Santo - Banestes", "Banco do Estado do Pará S.A - BANPARÁ", "Banco do Estado do Rio Grande do Sul - BANRISUL", "Banco Inter S.A.", "Banco Itaú Unibanco S.A.",
    "Banco Mercantil do Brasil S.A.", "Banco Modal S.A.", "Banco Original S.A.", "Banco Pan S.A", "Banco Safra S.A.", "Banco Santander (Brasil) S.A.", "Banco Semear S.A", "Banco Sofisa S.A.", "Banco Triangulo S.A.", "Banco Votorantim S.A.",
    "Banco Woori Bank do Brasil S.A.", "Banco XP S.A", "Caixa Econômica Federal", "Caruana S.A. - Sociedade de Crédito, Financiamento e Investimento", "Confederação Nacional das Cooperativa Centrais Unicreds LTDA",
    "Confederação Nacional das Cooperativas Centrais de Crédito e Economia Familiar e Solidária - Cresol Confederação", "Cooperativa Central de Crédito - AILOS", "Cooperativa de Crédito Rural de Ibiam - Sulcredi/Ibiam", "Cooperativa de Crédito Rural Seara",
    "Credisis - Central de Cooperativas de Crédito Ltda.", "Crefisa S.A. - Crédito, Financiamento e Investimento", "Mercadopago.com Representações Ltda.", "Neon Pagamentos S.A.", "NU Pagamentos S.A. - NUBANK", "Pagseguro Internet S.A.",
    "Pernambucanas Financiadora S.A. CFI", "Picpay Serviços S.A", "Social Bank Banco Múltiplo S.A", "Stone Pagamentos S/A", "Uniprime Central - Central Interestadual de Cooperativas de Crédito", "Uniprime Norte do Paraná - Cooperativa de Crédito"];
const ispbOptions = ["13140088", "27214112", "10664513", "54403563", "61186680", "60746948", "71027866", "30306294", "1858774", "31872495", "2038232", "1181521", "61033106", "4902979", "208", "27098060", "0", "13009717", "28127603", "4913711",
    "92702067", "416968", "60701190", "17184037", "30723886", "92894922", "59285411", "58160789", "90400888", "795423", "60889128", "17351180", "59588111", "15357060", "33264668", "360305", "9313766", "315557", "10398952", "5463212", "8240446",
    "204963", "4632856", "60779196", "10573521", "20855875", "18236120", "8561701", "43180355", "22896431", "15173776", "16501555", "3046391", "2398976"];
const codeOptions = ["332", "349", "121", "213", "318", "237", "218", "208", "413", "336", "756", "748", "069", "003", "070", "335", "001", "047", "021", "037", "041", "077", "341", "389", "746", "212", "623", "422",
    "033", "743", "637", "634", "655", "124", "348", "104", "130", "136", "133", "085", "391", "430", "097", "069", "323", "113", "260", "290", "174", "380", "412", "197", "099", "084"]

class ListAllBank extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            menuOptions: [],
            bankOptions: [],
            ispbOptions: [],
            codeOptions: [],
            snackBarOpen: false,
            value: props.value || ""
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
        this.setState({
            bankOptions: bankNames,
            menuOptions: bankNames,
            ispbOptions: ispbOptions,
            codeOptions: codeOptions
        })
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

    handleChange = (event) => {
        const searchTerm = event.target.value.toLowerCase();
        this.setState({
            menuOptions: this.state.bankOptions.filter((option, index) => {
                const isMatchByBankName = option.toLowerCase().includes(searchTerm);
                const isMatchByCode = this.state.codeOptions[index].includes(searchTerm);
                return isMatchByBankName || isMatchByCode;
            }),
            value: event.target.value
        });
    };

    handleClick = (option) => {
        let jsonObject = {};
        jsonObject["receiverInstitute"] = option;
        jsonObject["code"] = this.state.codeOptions[this.state.bankOptions.findIndex(item => item === option)];
        jsonObject["receiverIspb"] = this.state.ispbOptions[this.state.bankOptions.findIndex(item => item === option)];
        MetricServices.onPageTransitionStop(this.componentName, PageState.close);
        this.props.confirm(jsonObject);
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
                                {localeObj.salary_bank_header}
                            </div>
                            {androidApiCalls.getLocale() === "en_US" &&
                                <div className="body2 highEmphasis scroll" style={{ textAlign: "left", marginTop: "0.6rem" }}>
                                    {localeObj.salary_bank_desc}
                                </div>
                            }
                        </FlexView>
                    </div>
                    <MuiThemeProvider theme={theme1}>
                        <TextField value={this.state.value}
                            placeholder={localeObj.inform_data}
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
                        <div style={{ margin: "1.5rem", overflowY: "auto", height: `${screenHeight*0.6}px`, overflowX: "hidden" }}>
                            {
                                this.state.menuOptions.map((opt, key) => (
                                    <ListItem key={key} button onClick={() => this.handleClick(opt)}>
                                        <ListItemText className="body2 highEmphasis" primary={this.state.codeOptions[this.state.bankOptions.findIndex(item => item === opt)] + " - " + opt} />
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
ListAllBank.propTypes = {
    value: PropTypes.string,
    componentName: PropTypes.string,
    confirm: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
  }
export default withStyles(styles)(ListAllBank);