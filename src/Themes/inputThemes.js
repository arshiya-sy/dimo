import ColorPicker from "../Services/ColorPicker";
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import GeneralUtilities from "../Services/GeneralUtilities";
import { createMuiTheme, withStyles } from "@material-ui/core/styles";
import BackgroundImage from "../images/DarkThemeImages/Background StratusGradient.png";

const InputThemes = Object.freeze({

    SingleInputTheme: createMuiTheme({
        overrides: {
            MuiInput: {
                root: {
                    fontSize: "1.5rem",
                    color: ColorPicker.darkHighEmphasis,
                },
                underline: {
                    '&:before': {
                        borderBottom: '1px solid ' + ColorPicker.darkMediumEmphasis,
                    },
                    '&:after': {
                        borderImageSource: "linear-gradient(to right, RGBA(255, 85, 77, 0.99), RGB(255, 186, 143))",
                        borderBottom: "3.5px solid",
                        borderImageSlice: 1,
                    },
                    "&.Mui-error": {
                        '&:after': {
                            borderBottomColor: ColorPicker.errorRed,
                        }
                    },
                },
            },
            MuiFormControlLabel: {
                label: {
                    fontSize: "1.5rem",
                    color: ColorPicker.darkMediumEmphasis
                }
            },
            MuiFormLabel: {
                root: {
                    "&.Mui-error": {
                        fontSize: '0.875rem',
                        color: ColorPicker.darkHighEmphasis
                    },
                    "&$focused": {
                        fontSize: '0.875rem',
                        color: ColorPicker.darkHighEmphasis
                    },
                    "&.Mui-disabled": {
                        fontSize: '0.875rem',
                        color: ColorPicker.darkMediumEmphasis
                    }
                }
            },
            MuiFormControl: {
                root: {
                    margin: "0 1.5rem",
                    width: "85%",
                    position: "fixed",
                    top: GeneralUtilities.setElementPosition()
                },
                underline: {
                    '&:before': {
                        borderBottom: '1px solid ' + ColorPicker.darkMediumEmphasis,
                    },
                    '&:after': {
                        borderImageSource: "linear-gradient(to right, RGBA(255, 85, 77, 0.99), RGB(255, 186, 143))",
                        borderBottom: "3.5px solid",
                        borderImageSlice: 1,
                    },
                    "&.Mui-error": {
                        '&:after': {
                            borderBottomColor: ColorPicker.errorRed,
                        }
                    }
                }
            },
            MuiIconButton: {
                root: {
                    padding: "1.5rem"
                }
            },
            MuiInputBase: {
                root: {
                    "&.Mui-disabled": {
                        color: ColorPicker.darkHighEmphasis
                    }
                },
                input: {
                    padding: "0.375rem 0 0.625rem"
                }
            },
            MuiInputLabel: {
                shrink: {
                    transform: "translate(0, -3.5px) scale(1)"
                }
            }
        }
    }),

    MultipleInputTheme: createMuiTheme({
        overrides: {
            MuiInput: {
                root: {
                    fontSize: "1rem",
                    color: ColorPicker.darkHighEmphasis,
                },
                underline: {
                    '&:before': {
                        borderBottom: '1px solid ' + ColorPicker.darkMediumEmphasis,
                    },
                    '&:after': {
                        borderImageSource: "linear-gradient(to right, RGBA(255, 85, 77, 0.99), RGB(255, 186, 143))",
                        borderBottom: "3.5px solid",
                        borderImageSlice: 1,
                    },
                    "&.Mui-error": {
                        '&:after': {
                            borderBottomColor: ColorPicker.errorRed,
                        }
                    },
                },
            },
            MuiFormControlLabel: {
                label: {
                    fontSize: "1rem",
                    color: ColorPicker.darkMediumEmphasis
                }
            },
            MuiFormLabel: {
                root: {
                    "&.Mui-error": {
                        fontSize: '0.875rem',
                        color: ColorPicker.darkHighEmphasis
                    },
                    "&$focused": {
                        fontSize: '0.875rem',
                        color: ColorPicker.darkHighEmphasis
                    },
                    "&.Mui-disabled": {
                        fontSize: '0.875rem',
                        color: ColorPicker.darkMediumEmphasis
                    }
                }
            },
            MuiFormControl: {
                root: {
                    margin: "0 1.5rem",
                    width: "85%",
                    position: "fixed",
                    top: GeneralUtilities.setElementPosition()
                },
                underline: {
                    '&:before': {
                        borderBottom: '1px solid ' + ColorPicker.darkMediumEmphasis,
                    },
                    '&:after': {
                        borderImageSource: "linear-gradient(to right, RGBA(255, 85, 77, 0.99), RGB(255, 186, 143))",
                        borderBottom: "3.5px solid",
                        borderImageSlice: 1,
                    },
                    "&.Mui-error": {
                        '&:after': {
                            borderBottomColor: ColorPicker.errorRed,
                        }
                    }
                }
            },
            MuiIconButton: {
                root: {
                    padding: "1.5rem"
                }
            },
            MuiInputBase: {
                root: {
                    "&.Mui-disabled": {
                        color: ColorPicker.darkHighEmphasis
                    }
                },
                input: {
                    padding: "0.375rem 0 0.625rem"
                }
            },
            MuiInputLabel: {
                shrink: {
                    transform: "translate(0, -3.5px) scale(1)"
                }
            }
        }
    }),

    DetailsTheme: createMuiTheme({
        overrides: {
            MuiFormControlLabel: {
                label: {
                    fontSize: '1.5rem',
                    color: ColorPicker.darkMediumEmphasis
                }
            },
            MuiFormLabel: {
                root: {
                    "&.Mui-error": {
                        fontSize: '0.875rem',
                        color: ColorPicker.darkMediumEmphasis
                    },
                    "&$focused": {
                        fontSize: '0.875rem',
                        color: ColorPicker.darkMediumEmphasis
                    },
                    "&.Mui-disabled": {
                        fontSize: '0.875rem',
                        color: ColorPicker.darkHighEmphasis
                    }
                }
            },
            MuiFormControl: {
                root: {
                    margin: "0.5rem 1.5rem",
                    width: "85%"
                }
            },
            MuiInputBase: {
                root: {
                    "&.Mui-disabled": {
                        fontSize: "1rem",
                        color: ColorPicker.darkHighEmphasis,
                    },
                },
                input: {
                    padding: "0.375rem 0 0.625rem"
                }
            },
            MuiIconButton: {
                root: {
                    padding: "1.5rem"
                }
            },
            MuiInputLabel: {
                shrink: {
                    transform: "translate(0, -3.5px) scale(1)"
                }
            },
            MuiInput: {
                underline: {
                    "&.Mui-disabled:before": {
                        borderBottomStyle: "solid"
                    },
                }
            }
        }
    }),

    amountInputStyle: {
        input: {
            fontSize: "1.5rem",
            color: ColorPicker.darkHighEmphasis
        },
        helpertextstyle: {
            "&.MuiFormHelperText-root.Mui-error": {
                color: ColorPicker.errorRed,
            }
        },
        finalStyle: {
            fontSize: '1.5rem',
            color: ColorPicker.darkHighEmphasis
        },
        paper: {
            borderTopLeftRadius: "20px",
            borderTopRightRadius: "20px"
        }
    },

    CardTheme: createMuiTheme({
        overrides: {
            MuiPaper: {
                rounded: {
                    borderRadius: "1.75rem",
                    marginBottom: "1rem",
                    padding: "0.875rem",
                    display: "flex",
                    alignItems: "center"
                },
            }
        }
    }),

    TransferTheme: createMuiTheme({
        overrides: {
            MuiFormControlLabel: {
                label: {
                    fontSize: "1rem",
                    color: ColorPicker.darkHighEmphasis
                }
            },
            MuiFormLabel: {
                root: {
                    "&.Mui-error": {
                        fontSize: '0.875rem',
                        color: ColorPicker.darkMediumEmphasis
                    },
                    "&$focused": {
                        color: ColorPicker.darkHighEmphasis,
                        fontSize: '0.875rem',
                    },
                    "&.Mui-disabled": {
                        fontSize: '0.875rem',
                        color: ColorPicker.darkHighEmphasis
                    }
                }
            },
            MuiFormControl: {
                root: {
                    margin: "0 1.5rem",
                    width: "85%",
                    position: "fixed",
                    top: GeneralUtilities.setElementPosition()
                }
            },
            MuiIconButton: {
                root: {
                    padding: "1.5rem"
                }
            },
            MuiInputBase: {
                input: {
                    padding: "0.375rem 0 0.625rem",
                    "&.Mui-disabled": {
                        color: ColorPicker.darkHighEmphasis
                    }
                }
            },
            MuiInputLabel: {
                shrink: {
                    transform: "translate(0, -3.5px) scale(1)"
                }
            },
            MuiInput: {
                underline: {
                    "&.Mui-disabled:before": {
                        borderBottomStyle: "solid"
                    },
                }
            }
        }
    }),

    AmountTheme: createMuiTheme({
        overrides: {
            MuiFormControlLabel: {
                label: {
                    fontSize: '0.875rem',
                    color: ColorPicker.darkHighEmphasis
                }
            },
            MuiFormLabel: {
                root: {
                    "&$focused": {
                        color: ColorPicker.darkMediumEmphasis,
                        fontSize: '0.875rem',
                    },
                    "&.Mui-error": {
                        fontSize: '0.875rem',
                        color: ColorPicker.darkMediumEmphasis
                    }
                }
            },
            MuiFormControl: {
                root: {
                    width: "85%",
                    margin: "1rem 1.5rem"
                },
                underline: {
                    '&:before': {
                        borderBottom: '1px solid ' + ColorPicker.darkMediumEmphasis,
                    },
                    '&:after': {
                        borderImageSource: "linear-gradient(to right, RGBA(255, 85, 77, 0.99), RGB(255, 186, 143))",
                        borderBottom: "3.5px solid",
                        borderImageSlice: 1,
                    },
                    "&.Mui-error": {
                        '&:after': {
                            borderBottomColor: ColorPicker.errorRed,
                        }
                    },
                }
            },
            MuiOutlinedInput: {
                root: {
                    '&.Mui-focused fieldset': {
                        borderImageSource: "linear-gradient(to right, RGBA(255, 85, 77, 0.99), RGB(255, 186, 143))",
                        border: "2px solid",
                        borderImageSlice: 1,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderImageSource: "linear-gradient(to right, RGBA(255, 85, 77, 0.99), RGB(255, 186, 143))",
                        border: "2px solid",
                        borderImageSlice: 1,
                    }
                },
                notchedOutline: {
                    borderColor: ColorPicker.darkMediumEmphasis
                }
            },
            MuiIconButton: {
                root: {
                    padding: "1.5rem"
                }
            },
            MuiInput: {
                underline: {
                    "&.Mui-disabled:before": {
                        borderBottomStyle: "solid"
                    },
                }
            },
            MuiInputBase: {
                input: {
                    padding: "0.375rem 0 0.5rem"
                }
            },
            MuiInputLabel: {
                outlined: {
                    '&.MuiInputLabel-shrink': {
                        transform: "translate(24px, -8px) scale(1.15)"
                    }
                },
                shrink: {
                    transform: "translate(0, -3.5px) scale(1)"
                }
            },
            MuiTypography: {
                body1: {
                    fontSize: "1.5rem"
                },
                colorTextSecondary: {
                    color: "none"
                }
            }
        }
    }),

    feedbackTheme: createMuiTheme({
        overrides: {
            MuiFormControl: {
                root: {
                    margin: "0 1.5rem",
                    width: "90%"
                }
            },
            MuiOutlinedInput: {
                root: {
                    borderRadius: "0.5rem",
                    '&.Mui-focused fieldset': {
                        borderColor: ColorPicker.darkMediumEmphasis,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: ColorPicker.darkMediumEmphasis,
                    },
                    '&.Mui-disabled fieldset': {
                        borderColor: ColorPicker.darkDisabled,
                    },
                    '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
                        borderColor: ColorPicker.darkDisabled,
                    }
                },
                input: {
                    padding: "0.75rem 1rem"
                },
            },
            MuiIconButton: {
                root: {
                    padding: "1.5rem"
                }
            },
            MuiFormLabel: {
                root: {
                    fontSize: '0.875rem',
                    color: ColorPicker.mediumEmphasis,
                    lineHeight: "1rem"
                }
            },
            MuiInputLabel: {
                outlined: {
                    transform: "translate(14px, 12px) scale(1)"
                }
            },
            MuiInputBase: {
                input: {
                    color: ColorPicker.darkHighEmphasis,
                    padding: "0.375rem 0 0.625rem"
                },
                root: {
                    fontSize: "1rem",
                    lineHeight: "1.5rem"
                }
            },
            MuiListItem: {
                root: {
                    paddingTop: "0.25rem",
                    paddingBottom: "0.25rem",
                    justifyContent: "space-between"
                },
                gutters: {
                    paddingLeft: "1.5rem",
                    paddingRight: "1.5rem"
                }
            },
        }
    }),

    snackBarTheme: createMuiTheme({
        overrides: {
            MuiAlert: {
                root: {
                    backgroundColor: ColorPicker.newProgressBar,
                    padding: "1rem",
                    borderRadius: "0.5rem",
                    margin: "1rem",
                    width: "100%"
                },
                message: {
                    color: ColorPicker.darkHighEmphasis,
                    padding: "0 0.5rem"
                },
                filledSuccess: {
                    backgroundColor: ColorPicker.newProgressBar
                }
            },
            MuiTypography: {
                body1: {
                    fontSize: "0.875rem",
                    lineHeight: "1rem",
                    color: ColorPicker.darkMediumEmphasis,
                    letterSpacing: "0",
                    fontFamily: "Roboto"
                },
                body2: {
                    fontSize: "1rem",
                    lineHeight: "1.75rem",
                    letterSpacing: "0.5px",
                    fontFamily: "Roboto"
                },
                colorTextSecondary: {
                    color: ColorPicker.darkHighEmphasis,
                }
            },
            MuiListItem: {
                gutters: {
                    paddingLeft: "0",
                    paddingRight: "0"
                }
            },
            MuiPaper: {
                root: {
                    backgroundColor: "transparent"
                },
                rounded: {
                    borderRadius: "1.5rem"
                }
            }
        }
    }),

    snackBarThemeForMyCards: createMuiTheme({
        overrides: {
            MuiAlert: {
                root: {
                    backgroundColor: ColorPicker.newProgressBar,
                    padding: "1rem",
                    borderRadius: "0.5rem",
                    margin: "1rem",
                    width: "100%"
                },
                message: {
                    color: ColorPicker.darkHighEmphasis,
                    padding: "0 0.5rem"
                },
                filledSuccess: {
                    backgroundColor: ColorPicker.newProgressBar
                }
            },
            MuiTypography: {
                body1: {
                    fontSize: "0.875rem",
                    lineHeight: "1rem",
                    color: ColorPicker.darkMediumEmphasis,
                    letterSpacing: "0",
                    fontFamily: "Roboto"
                },
                body2: {
                    fontSize: "1rem",
                    lineHeight: "1.75rem",
                    letterSpacing: "0.5px",
                    fontFamily: "Roboto"
                },
                colorTextSecondary: {
                    color: ColorPicker.darkHighEmphasis,
                }
            },
            MuiPaper: {
                root: {
                    borderTopLeftRadius: "20px",
                    borderTopRightRadius: "20px",
                    backgroundColor: ColorPicker.newProgressBar
                },
                rounded: {
                    borderRadius: "1.75rem",
                    marginBottom: "1rem",
                    padding: "0.875rem",
                    display: "flex",
                    alignItems: "center"
                },
                outlined: {
                    border: "1px solid " + ColorPicker.darkMediumEmphasis,
                },
            }
        }
    }),

    snackBarWithoutPaperTheme: createMuiTheme({
        overrides: {
            MuiAlert: {
                root: {
                    backgroundColor: ColorPicker.newProgressBar,
                    padding: "1rem",
                    borderRadius: "0.5rem",
                    margin: "1rem",
                    width: "100%"
                },
                message: {
                    color: ColorPicker.darkHighEmphasis,
                    padding: "0 0.5rem"
                },
                filledSuccess: {
                    backgroundColor: "none"
                }
            },
            MuiTypography: {
                body1: {
                    fontSize: "0.875rem",
                    lineHeight: "1rem",
                    color: ColorPicker.darkMediumEmphasis,
                    letterSpacing: "0",
                    fontFamily: "Roboto"
                },
                body2: {
                    fontSize: "1rem",
                    lineHeight: "1.75rem",
                    letterSpacing: "0.5px",
                    fontFamily: "Roboto"
                },
                colorTextSecondary: {
                    color: ColorPicker.darkHighEmphasis,
                }
            },
            MuiListItem: {
                gutters: {
                    paddingLeft: "0",
                    paddingRight: "0"
                }
            }
        }
    }),

    MuiAlertForReceiptComponent: createMuiTheme({
        overrides: {
            MuiAlert: {
                root: {
                    backgroundColor: ColorPicker.newProgressBar,
                    padding: "1rem",
                    borderRadius: "0.5rem",
                    margin: "1rem",
                    width: "100%"
                },
                message: {
                    color: ColorPicker.darkHighEmphasis,
                    padding: "0 0.5rem"
                },
                filledSuccess: {
                    backgroundColor: "none"
                }
            }
        }
    }),

    pixLandingTheme: createMuiTheme({
        overrides: {
            MuiGrid: {
                item: {
                    boxSizing: "none"
                },
            },
            MuiPaper: {
                elevation1: {
                    boxShadow: "none"
                }
            },
        }
    }),

    TermsTheme: createMuiTheme({
        overrides: {
            MuiPaper: {
                outlined: {
                    border: "none"
                }
            },
            MuiCard: {
                root: {
                    overflowY: "scroll",
                    overflowX: "hidden"
                }
            },
            MuiList: {
                root: {
                    marginRight: "0.5rem"
                }
            },
            MuiTypography: {
                root: {
                    color: ColorPicker.darkMediumEmphasis
                }
            },
        }
    }),

    CalenderTheme: createMuiTheme({
        overrides: {
            MuiIconButton: {
                root: {
                    color: ColorPicker.darkHighEmphasis,
                    padding: "0 1.5rem",
                    "&.Mui-disabled": {
                        color: ColorPicker.darkDisabled,
                    },
                },
            },
            MuiSvgIcon: {
                root: {
                    fontSize: "2rem"
                }
            },
            MuiTypography: {
                body1: {
                    fontWeight: 500,
                    fontSize: "0.875rem",
                    color: ColorPicker.darkHighEmphasis
                }
            },
            MuiPickersCalendarHeader: {
                switchHeader: {
                    marginBottom: "2rem",
                    marginLeft: "-1.5rem",
                    marginRight: "-1.5rem",
                    justifyContent: "space-evenly"
                },
                daysHeader: {
                    justifyContent: "space-evenly",
                    marginBottom: "1.5rem"
                },
                dayLabel: {
                    margin: "0",
                    color: ColorPicker.darkHighEmphasis,
                    fontWeight: 500,
                    fontSize: "0.875rem",
                    lineHeight: "2rem"
                },
                iconButton: {
                    backgroundColor: "transparent",
                    color: ColorPicker.white,
                    "&.Mui-disabled": {
                        color: ColorPicker.darkDisabled,
                    }
                }
            },
            MuiPickersCalendar: {
                week: {
                    justifyContent: "space-evenly"
                }
            },
            MuiPickersDay: {
                day: {
                    margin: "0",
                    color: ColorPicker.darkHighEmphasis,
                    fontWeight: 400,
                    fontSize: "0.875rem",
                    lineHeight: "2rem"
                },
                daySelected: {
                    color: ColorPicker.darkHighEmphasis,
                    fontWeight: 400,
                    background: "linear-gradient(135deg, RGBA(255, 85, 77, 0.99), RGB(255, 186, 143))",
                    "&:hover": {
                        background: "linear-gradient(135deg, RGBA(255, 85, 77, 0.99), RGB(255, 186, 143))",
                    }
                },
                current: {
                    color: ColorPicker.darkHighEmphasis,
                    fontWeight: 400,
                },
                dayDisabled: {
                    color: ColorPicker.darkDisabled,
                }
            }
        },
    }),

    DueDateTheme: createMuiTheme({
        overrides: {
            MuiFormControl: {
                root: {
                    width: "100%",
                    position: "fixed",
                    top: GeneralUtilities.setElementPosition()
                }
            },
            MuiFormLabel: {
                root: {
                    "&$focused": {
                        fontSize: '0.875rem',
                        color: ColorPicker.darkerAccent
                    },

                }
            },
            MuiPickersToolbar: {
                toolbar: {
                    backgroundColor: ColorPicker.regularAccent,
                },
            },
            MuiPickersDatePickerRoot: {
                toolbar: {
                    alignItems: "center"
                }
            },
            MuiPickersMonth: {
                root: {
                    flex: "1 0 25%",
                    height: "50px",
                    '&:focus': {
                        color: ColorPicker.white,
                    }
                },
                monthSelected: {
                    backgroundColor: ColorPicker.regularAccent,
                    color: ColorPicker.white,
                    borderRadius: "50%"
                },
            },
            MuiTypography: {
                h5: {
                    fontSize: "1em"
                },
                colorPrimary: {
                    color: ColorPicker.darkHighEmphasis
                }
            },
            MuiPickersMonthSelection: {
                container: {
                    margin: "5%",
                    width: "90%"
                }
            },
            MuiPickersBasePicker: {
                pickerView: {
                    minHeight: "0"
                },
            },
            MuiButton: {
                textPrimary: {
                    color: ColorPicker.regularAccent
                }
            },
            MuiIconButton: {
                root: {
                    padding: "1.5rem"
                }
            },
            MuiInputLabel: {
                shrink: {
                    transform: "translate(0, -3.5px) scale(1)"
                }
            }
        },
    }),

    MultiLineInputTheme: createMuiTheme({
        overrides: {
            MuiOutlinedInput: {
                root: {
                    '&$focused $notchedOutline': {
                        borderColor: ColorPicker.darkDisabled,
                    },
                },
                notchedOutline: {
                    border: "2px solid " + ColorPicker.darkDisabled,
                    borderRadius: "1rem",
                    borderColor: ColorPicker.darkDisabled
                }
            },
            MuiInput: {
                underline: {
                    '&:after': {
                        borderBottom: "2px solid " + ColorPicker.regularAccent
                    }
                },

            },
            MuiFormControlLabel: {
                label: {
                    fontSize: '0.875rem',
                    color: ColorPicker.darkHighEmphasis,
                    textTransform: "none",
                    fontWeight: "500",
                    letterSpacing: "0.1px"
                },
            },
            MuiFormLabel: {
                root: {
                    "&$focused": {
                        color: ColorPicker.darkerAccent,
                        fontSize: '0.875rem',
                    },
                }
            },
            MuiFormControl: {
                root: {
                    width: "100%",
                    overflow: "auto",
                    margin: "0"
                }
            },
            MuiIconButton: {
                root: {
                    padding: "1.5rem"
                }
            },
            MuiInputBase: {
                input: {
                    fontSize: '0.875rem',
                    color: ColorPicker.darkHighEmphasis,
                    textTransform: "none",
                    fontWeight: "400",
                    letterSpacing: "0.25px",
                    padding: "0.375rem 0 0.625rem"
                }
            },
            MuiInputLabel: {
                shrink: {
                    transform: "translate(0, -3.5px) scale(1)"
                }
            }
        }
    }),

    OperatorMenuTheme: createMuiTheme({
        overrides: {
            MuiPaper: {
                root: {
                    backgroundColor: "transparent"
                },
                rounded: {
                    borderRadius: "1.5rem",
                    margin: "1rem",
                    padding: "1.2rem",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    background: "transparent"
                },
                outlined: {
                    border: "1px solid " + ColorPicker.darkMediumEmphasis,
                },
            },
            MuiIconButton: {
                root: {
                    padding: "1.5rem"
                }
            },
            MuiAlert: {
                root: {
                    backgroundColor: ColorPicker.newProgressBar,
                    padding: "1rem",
                    borderRadius: "0.5rem",
                    margin: "1rem",
                    width: "80%"
                },
                message: {
                    color: ColorPicker.white,
                    padding: "0 0.5rem"
                },
                filledSuccess: {
                    backgroundColor: "none"
                }
            },
            MuiTypography: {
                body1: {
                    fontSize: "0.875rem",
                    lineHeight: "1rem",
                    color: ColorPicker.darkMediumEmphasis,
                    letterSpacing: "0",
                    fontFamily: "Roboto"
                },
                body2: {
                    fontSize: "1rem",
                    lineHeight: "1.75rem",
                    letterSpacing: "0.5px",
                    fontFamily: "Roboto"
                },
                colorTextSecondary: {
                    color: ColorPicker.darkHighEmphasis,
                }
            },
            MuiListItem: {
                gutters: {
                    paddingLeft: "0",
                    paddingRight: "0"
                }
            },
        }
    }),

    SalaryWithDrawTheme: createMuiTheme({
        overrides: {
            MuiListItem: {
                gutters: {
                    paddingLeft: "0.5rem",
                    paddingRight: "0"
                }
            },
            MuiTypography: {
                body1: {
                    lineHeight: "1rem"
                },
            }
        }
    }),

    CancelWarningTheme: createMuiTheme({
        overrides: {
            MuiListItem: {
                gutters: {
                    paddingLeft: "0.5rem",
                    paddingRight: "0"
                }
            },
            MuiTypography: {
                body1: {
                    lineHeight: "1rem"
                },
            },
            MuiListItemIcon: {
                root: {
                    alignSelf: "flex-start",
                }
            }
        }
    }),

    SearchInputTheme: createMuiTheme({
        overrides: {
            MuiInput: {
                underline: {
                    '&:after': {
                        borderBottom: "2px solid " + ColorPicker.regularAccent
                    },
                },
            },
            MuiFormControl: {
                root: {
                    margin: "0.5rem 1.5rem",
                    width: "85%",
                }
            },
            MuiListItem: {
                gutters: {
                    padding: "0.5rem 0",
                    paddingLeft: "0",
                    paddingRight: "0"
                }
            },
            MuiIconButton: {
                root: {
                    padding: "1.5rem"
                }
            },
            MuiInputBase: {
                input: {
                    padding: "0.375rem 0 0.625rem"
                }
            },
            MuiInputLabel: {
                shrink: {
                    transform: "translate(0, -3.5px) scale(1)"
                }
            },
            MuiTypography: {
                body1: {
                    fontSize: "1rem",
                    lineHeight: "1.75rem",
                    color: ColorPicker.darkHighEmphasis,
                    letterSpacing: "0.2px",
                    fontFamily: "Roboto"
                },
                body2: {
                    fontSize: "0.875rem",
                    lineHeight: "1.25rem",
                    letterSpacing: "0.35px",
                    fontFamily: "Roboto"
                },
                colorTextSecondary: {
                    color: ColorPicker.darkMediumEmphasis,
                }
            },
            MuiPaper: {
                root: {
                    backgroundColor: "transparent"
                }
            }
        }
    }),

    SecurityInputTheme: createMuiTheme({
        overrides: {
            MuiInput: {
                underline: {
                    '&:after': {
                        borderBottom: "2px solid " + ColorPicker.regularAccent
                    },
                },
            },
            MuiFormControl: {
                root: {
                    margin: "0.5rem 1.5rem",
                    width: "85%",
                }
            },
            MuiListItem: {
                gutters: {
                    padding: "0.5rem 0",
                    paddingLeft: "0",
                    paddingRight: "0"
                }
            },
            MuiIconButton: {
                root: {
                    padding: "1.5rem"
                }
            },
            MuiInputBase: {
                input: {
                    padding: "0.375rem 0 0.625rem"
                }
            },
            MuiInputLabel: {
                shrink: {
                    transform: "translate(0, -3.5px) scale(1)"
                }
            },
            MuiTypography: {
                body1: {
                    fontSize: "1rem",
                    lineHeight: "1.75rem",
                    color: ColorPicker.darkHighEmphasis,
                    letterSpacing: "0.2px",
                    fontFamily: "Roboto"
                },
                body2: {
                    fontSize: "0.875rem",
                    lineHeight: "1.25rem",
                    letterSpacing: "0.35px",
                    fontFamily: "Roboto"
                },
                colorTextSecondary: {
                    color: ColorPicker.darkMediumEmphasis,
                }
            },
            MuiAlert: {
                root: {
                    backgroundColor: ColorPicker.newProgressBar,
                    padding: "1rem",
                    borderRadius: "0.5rem",
                    margin: "1rem",
                    width: "100%"
                },
                message: {
                    color: ColorPicker.darkHighEmphasis,
                    padding: "0 0.5rem"
                },
                filledSuccess: {
                    backgroundColor: "none"
                }
            },
            MuiPaper: {
                root: {
                    backgroundColor: "transparent !important"
                }
            }
        }
    }),

    CategoryInputTheme: createMuiTheme({
        overrides: {
            MuiInput: {
                underline: {
                    '&:before': {
                        borderBottom: "1px solid " + ColorPicker.white
                    }
                }
            },
            MuiFormControl: {
                root: {
                    margin: "0.5rem 1.5rem",
                    width: "85%",
                }
            },
            MuiIconButton: {
                root: {
                    padding: "1.5rem"
                }
            },
            MuiInputBase: {
                input: {
                    padding: "0.375rem 0 1rem"
                }
            },
            MuiInputLabel: {
                shrink: {
                    transform: "translate(0, -3.5px) scale(1)"
                }
            }
        }
    }),

    SliderInput: createMuiTheme({
        overrides: {
            MuiSlider: {
                root: {
                    color: ColorPicker.accent
                },
                track: {
                    height: "5px"
                },
                thumb: {
                    height: "1rem",
                    width: "1rem"
                },
                mark: {
                    backgroundColor: "none"
                },
                markLabel: {
                    color: ColorPicker.white
                },
                markActive: {
                    backgroundColor: "none"
                },
                markLabelActive: {
                    color: ColorPicker.white
                }
            }
        }
    }),

    PushInput: createMuiTheme({
        overrides: {
            MuiListItemIcon: {
                root: {
                    minWidth: "2rem",
                    alignSelf: "flex-start"
                }
            }
        }
    }),

    FGTSListItemTheme: createMuiTheme({
        overrides: {
            MuiListItem: {
                root: {
                    paddingTop: "-0.5rem",
                    paddingBottom: "-0.5rem"
                }
            }
        }
    }),

    singleInputStyle: {
        input: {
            fontSize: "1.5rem",
            color: ColorPicker.darkMediumEmphasis,
            lineHeight: "2rem",
            letterSpacing: "0.5px"
        },
        finalInput: {
            fontSize: "1.5rem",
            color: ColorPicker.darkHighEmphasis
        },
        multipleInput: {
            fontSize: "1rem",
            color: ColorPicker.darkMediumEmphasis,
            lineHeight: "normal",
            letterSpacing: "0.5px"
        },
        multipleFinalInput: {
            fontSize: "1rem",
            color: ColorPicker.darkHighEmphasis
        },
        helpertextstyle: {
            color: ColorPicker.errorRed,
            "&.MuiFormHelperText-root.Mui-error": {
                color: ColorPicker.errorRed,
            }
        },
        finalStyle: {
            fontSize: '0.875rem',
            color: ColorPicker.darkHighEmphasis
        },
        paper: {
            borderTopLeftRadius: "20px",
            borderTopRightRadius: "20px",
            backgroundColor: ColorPicker.newProgressBar
        },
        underline: {
            '&:before': {
                borderBottom: '1px solid ' + ColorPicker.darkMediumEmphasis,
            },
            '&:after': {
                borderImageSource: "linear-gradient(to right, RGBA(255, 85, 77, 0.99), RGB(255, 186, 143))",
                borderBottom: "3.5px solid",
                borderImageSlice: 1,
            },
            '&:error::after': {
                borderBottomColor: ColorPicker.errorRed,
                borderImageSource: "none"
            }
        },
        finalUnderline: {
            borderImageSource: "linear-gradient(to right, RGBA(255, 85, 77, 0.99), RGB(255, 186, 143))",
            borderBottom: "3.5px solid",
            borderImageSlice: 1,
        },
        fab: {
            backgroundColor: ColorPicker.duskHorizon,
            width: "3.5rem",
            height: "3.5rem",
            padding: "1rem",
            boxShadow: "0px 4px 5px 0px rgb(0 0 0 / 14%), 0px 1px 10px 0px rgb(0 0 0 / 12%), 0px 2px 4px -1px rgb(0 0 0 / 20%)",
            "&:hover": {
                backgroundColor: ColorPicker.accent
            },
            "&:active": {
                boxShadow: "0px 4px 5px 0px rgb(0 0 0 / 14%), 0px 1px 10px 0px rgb(0 0 0 / 12%), 0px 2px 4px -1px rgb(0 0 0 / 20%)",
            },
        },
        fullScreenDrawer: {
            backgroundSize: 'cover',
            backgroundImage: "url('" + BackgroundImage + "')",
            overscrollBehavior: 'contain',
            backgroundColor: '#031E3A',
            height: '100%'
        }
    },

    singleInputStyleWithPaper: {
        input: {
            fontSize: "1.5rem",
            color: ColorPicker.darkMediumEmphasis,
            lineHeight: "2rem",
            letterSpacing: "0.5px"
        },
        finalInput: {
            fontSize: "1.5rem",
            color: ColorPicker.darkHighEmphasis
        },
        helpertextstyle: {
            color: ColorPicker.errorRed,
            "&.MuiFormHelperText-root.Mui-error": {
                color: ColorPicker.errorRed,
            }
        },
        finalStyle: {
            fontSize: '0.875rem',
            color: ColorPicker.darkHighEmphasis
        },
        paper: {
            borderTopLeftRadius: "20px",
            borderTopRightRadius: "20px",
            backgroundColor: ColorPicker.newProgressBar
        },
        underline: {
            '&:before': {
                borderBottom: '1px solid ' + ColorPicker.darkMediumEmphasis,
            },
            '&:after': {
                borderImageSource: "linear-gradient(to right, RGBA(255, 85, 77, 0.99), RGB(255, 186, 143))",
                borderBottom: "3.5px solid",
                borderImageSlice: 1,
            },
            '&:error::after': {
                borderBottomColor: ColorPicker.errorRed,
                borderImageSource: "none"
            }
        },
        finalUnderline: {
            borderImageSource: "linear-gradient(to right, RGBA(255, 85, 77, 0.99), RGB(255, 186, 143))",
            borderBottom: "3.5px solid",
            borderImageSlice: 1,
        },
        fab: {
            backgroundColor: ColorPicker.duskHorizon,
            width: "3.5rem",
            height: "3.5rem",
            padding: "1rem",
            boxShadow: "0px 4px 5px 0px rgb(0 0 0 / 14%), 0px 1px 10px 0px rgb(0 0 0 / 12%), 0px 2px 4px -1px rgb(0 0 0 / 20%)",
            "&:hover": {
                backgroundColor: ColorPicker.accent
            },
            "&:active": {
                boxShadow: "0px 4px 5px 0px rgb(0 0 0 / 14%), 0px 1px 10px 0px rgb(0 0 0 / 12%), 0px 2px 4px -1px rgb(0 0 0 / 20%)",
            },
        },
        fullScreenDrawer: {
            backgroundSize: 'cover',
            backgroundImage: "url('" + BackgroundImage + "')",
            overscrollBehavior: 'contain',
            backgroundColor: '#031E3A',
            height: '100%'
        },
        MuiPaper: {
            root: {
                borderTopLeftRadius: "20px",
                borderTopRightRadius: "20px",
                backgroundColor: ColorPicker.newProgressBar
            },
            rounded: {
                borderRadius: "1.75rem",
                marginBottom: "1rem",
                padding: "0.875rem",
                display: "flex",
                alignItems: "center"
            },
            outlined: {
                border: "1px solid " + ColorPicker.darkMediumEmphasis,
            },
        },
    },

    payStyle: {
        input: {
            fontSize: "1.5rem",
            color: ColorPicker.darkMediumEmphasis,
        },
        finalInput: {
            fontSize: "1.5rem",
            color: ColorPicker.darkHighEmphasis
        },
        finalStyle: {
            fontSize: '0.875rem',
            color: ColorPicker.darkMediumEmphasis
        },
        underline: {
            '&:before': {
                borderBottom: '1px solid ' + ColorPicker.darkMediumEmphasis,
            },
            '&:after': {
                borderImageSource: "linear-gradient(to right, RGBA(255, 85, 77, 0.99), RGB(255, 186, 143))",
                borderBottom: "3.5px solid",
                borderImageSlice: 1,
            },
            "&.Mui-error": {
                '&:after': {
                    borderBottomColor: ColorPicker.errorRed,
                }
            },
        }
    },

    initialMarginStyle: {
        margin: "2rem 1.5rem"
    },

    largestInitialMarginStyle: {
        margin: "1rem 1.5rem"
    },

    bottomButtonStyle: {
        width: "100%",
        position: "fixed",
        bottom: "1.5rem",
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        alignItems: "center",
    },
    gpayButtonStyle: {
        width: "100%",
        position: "fixed",
        bottom: "3rem",
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        alignItems: "center",
    },

    // Replace "fixed" with "absolute" when keyboard sync is resolved
    hideButtonStyle: {
        width: "100%",
        position: "fixed",
        bottom: "1.5rem",
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        alignItems: "center",
    },

    transactionHistoryStyle: {
        width: "100%",
        position: "relative",
        bottom: "1.5rem"
    },

    waitListButtonStyle: {
        width: "100%",
        position: "fixed",
        bottom: "0.5rem"
    },

    identifyButtonStyle: {
        width: "100%",
        position: "absolute",
        bottom: "1.5rem",
        align: "center"
    },

    feedbackBtnStyle: {
        width: "100%",
        position: "fixed",
        bottom: "0.5rem",
        align: "center"
    },

    descriptionWithoutField: {
        textAlign: "left",
        marginTop: "0.6rem"
    },

    descriptionWithField: {
        textAlign: "left",
        marginTop: "0.6rem",
        height: "4rem",
        overflowY: "auto"
    },

    formButtonStyle: {
        width: "100%",
        position: "fixed",
        bottom: GeneralUtilities.isScreenSetToMax() ? "0.25rem" : "1.5rem",
        align: "center"
    },

    multipleInputStyle: {
        input: {
            fontSize: "1rem",
            color: ColorPicker.darkMediumEmphasis
        },
        finalInput: {
            fontSize: "1rem",
            color: ColorPicker.darkHighEmphasis
        },
        helpertextstyle: {
            "&.MuiFormHelperText-root.Mui-error": {
                color: ColorPicker.errorRed,
            }
        },
        finalStyle: {
            fontSize: '0.875rem',
            color: ColorPicker.darkMediumEmphasis
        },
        paper: {
            borderTopLeftRadius: "20px",
            borderTopRightRadius: "20px",
            backgroundColor: ColorPicker.newProgressBar
        },
        inputType: {
            type: "tel",
        },
        floatingLabelFocusStyle: {
            color: ColorPicker.darkMediumEmphasis
        },
        underline: {
            '&:before': {
                borderBottom: '1px solid ' + ColorPicker.darkMediumEmphasis,
            },
            '&:after': {
                borderImageSource: "linear-gradient(to right, RGBA(255, 85, 77, 0.99), RGB(255, 186, 143))",
                borderBottom: "3.5px solid",
                borderImageSlice: 1,
            },
        },
        error: {
            borderBottom: '1px solid ' + ColorPicker.errorRed,
        },
        verifiedHelperText: {
            fontSize: "0.75rem",
            color: ColorPicker.darkHighEmphasis
        }
    },

    DownloadSnackbarTheme: createMuiTheme({
        overrides: {
            MuiPaper: {
                elevation4: {
                    boxShadow: "none"
                },
                root: {
                    backgroundColor: ColorPicker.newProgressBar
                }
            },
            MuiIconButton: {
                root: {
                    padding: "1.5rem"
                }
            },
            MuiToolbar: {
                root: {
                    justifyContent: "space-between"
                },
                regular: {
                    height: "3.5rem",
                },
                gutters: {
                    paddingLeft: "0",
                    paddingRight: "0"
                }
            }
        }
    }),

    PeriodSelectorTheme: createMuiTheme({
        overrides: {
            MuiPaper: {
                root: {
                    backgroundColor: ColorPicker.disableBlack
                },
                rounded: {
                    borderRadius: "0.75rem",
                    margin: "1rem",
                    padding: "1.2rem",
                    display: "flex",
                    background: ColorPicker.disableBlack
                }
            }
        }
    }),

    FgtsTableCell: withStyles(() => ({
        head: {
            color: ColorPicker.darkHighEmphasis,
        },
        body: {
            fontSize: '0.875rem',
        },
    }))(TableCell),

    FgtsTableRow: withStyles(() => ({
        root: {
            '&:nth-of-type(odd)': {
                backgroundColor: ColorPicker.highEmphasis,
            },
        },
    }))(TableRow),
});



export default InputThemes;
