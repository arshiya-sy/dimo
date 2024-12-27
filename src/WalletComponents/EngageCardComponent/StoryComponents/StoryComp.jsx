import React from 'react';
import PropTypes from 'prop-types';

import MuiAlert from '@material-ui/lab/Alert';
import Snackbar from '@material-ui/core/Snackbar';
import { MuiThemeProvider } from "@material-ui/core/styles";
import Observer from "@researchgate/react-intersection-observer";

import Story from '../../Story';
import DomRenderComp from '../DomRenderComponent';
import InputThemes from "../../../Themes/inputThemes";
import constantObjects from "../../../Services/Constants";

const theme2 = InputThemes.snackBarTheme;

export default class StoryComp extends React.PureComponent {
  constructor(props) {
    super(props);

    let cardObj = this.props.card;

    this.storyObj = cardObj;
    if (!(cardObj instanceof Story)) {
      this.storyObj = new Story(cardObj, this.props.streamid);
    }

    this.state = {
      showCardOptions: true,
      snackbarOpen: false,
      snackbarMessage: null
    };

    this.styles = {
      container: Object.assign({
        position: 'relative',
        height: '100%',
        width: '100%',
        background: 'transparent',
        overflow: 'hidden',
        borderRadius: 'inherit',
      }, props.style),
    };
    this.cardObj = cardObj;
    this.gazeMetricsObj = {};
  }

  cardOptions = [
    {
      name: "Remove Card",
      icon: "delete",
      type: "delete",
      disabled: false,
      visible: true,
      action: (() => {
        this.storyObj.deleteCard();
        this.setState({
          deleted: true,
        });
      }).bind(this),
    }
  ];

  handleIntersection = () => {}
  
  closeSnackBar = () => {
      this.setState({ snackbarOpen: false });
  }

  openSnackBar = (message) => {
      this.setState({
          snackbarOpen: true,
          snackbarMessage: message
      });
  }

  render() {
    let { dontObserve = false } = this.props;
    let styles = this.styles;
    const options = {
      onChange: () => this.handleIntersection(),
      root: "#cardContainer",
      rootMargin: "-5% 0% -5%",
      threshold: [0, 0.1]
    };
    let deviceWidth = window.innerWidth - 16; //considering left and right margin of 8px outside the card
    let isEngageCarousel = false;
    let carouselCardWidth, carouselCardLeft;
    if (this.props.card.streamtype === "Engage" && this.props.allcards && this.props.allcards.length > 1) {
      isEngageCarousel = true;
      let domCardWidth = "100%";
      if (this.props.card.dom && this.props.card.dom.parentsize) {
        domCardWidth = this.props.card.dom.parentsize.width;
      }
      let sumOfWidthAllCards = 0;
      for (let k = 0; k < this.props.allcards.length; k++) {
        sumOfWidthAllCards = sumOfWidthAllCards + parseInt(this.props.allcards[k].dom.parentsize.width);
      }
      carouselCardWidth = deviceWidth / 100 * parseInt(domCardWidth) + "px";
      let cardIndex = parseInt(this.props.card.cardIndex);
      let paddingValue = 8;
      if (cardIndex > 1) {
        let cumulativeWidthSoFar = 0;
        for (let j = 1; j < cardIndex; j++) {
          /**
           * Correction Factor - 310/sumOfWidthOfAllCards is needed due to he following reasons
           * 310 px is the standard width of the card in which each card in carousel share space
           * in proportional to their individual width
           * carouselCardLeft of card i = Sum of width of all (i-1) cards - correctionFactor;
           */
          cumulativeWidthSoFar = cumulativeWidthSoFar + parseInt(this.props.allcards[j - 1].dom.parentsize.width)
            * (deviceWidth / 100 - (deviceWidth) / sumOfWidthAllCards) + paddingValue;
        }
        carouselCardLeft = cumulativeWidthSoFar + "px";
      }
    }

    // if(this.storyObj.IsStoryValid() && !this.storyObj.isDeleted()) {
    //if (this.storyObj.dom && !this.storyObj.isDeleted()) {

    this.storyObj.openSnackBar = (message) => this.openSnackBar(message);
    return (
      <div className='container text-center' data-content-id={this.storyObj.contentid} style={isEngageCarousel ? {
        ...styles.container,
        width: carouselCardWidth,
        left: carouselCardLeft,
        marginBottom: 0
      } : styles.container}>

        {this.storyObj.dom && (dontObserve ? <DomRenderComp storydom={this.storyObj} cardOps={this.props.cardOps} /> :
          <Observer {...options}>
            <DomRenderComp storydom={this.storyObj} cardOps={this.props.cardOps} />
          </Observer>
        )}

        <MuiThemeProvider theme={theme2}>
            <Snackbar open={this.state.snackbarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION}
                onClose={this.closeSnackBar}>
                <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.snackbarMessage}</MuiAlert>
            </Snackbar>
        </MuiThemeProvider>
      </div>
    );
  }
}

StoryComp.propTypes = {
  card: PropTypes.object,
  cardOps: PropTypes.any,
  style: PropTypes.object,
  streamid: PropTypes.string,
  allcards: PropTypes.object,
  dontObserve: PropTypes.bool,
};
