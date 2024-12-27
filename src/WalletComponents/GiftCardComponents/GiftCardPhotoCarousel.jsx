// PhotoCarousel.js
import React from 'react';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import './PhotoCarousel.css';
import FlexView from 'react-flexview';
import { MuiThemeProvider, createTheme} from "@material-ui/core/styles";
import MobileStepper from '@material-ui/core/MobileStepper';
import ColorPicker from '../../Services/ColorPicker';
import PropTypes from "prop-types";

const GiftCardPhotoCarousel = ({ photos }) => {
  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 3000 },
      items: 1,
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 1,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 1,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
    },
  };

  const theme1 = createTheme({
    overrides: {
        MuiGrid: {
            item: {
                boxSizing: "none"
            }
        },
        MuiPaper: {
            elevation1: {
                boxShadow: "none"
            }
        },
        MuiMobileStepper: {
            dotActive: {
                backgroundColor: ColorPicker.darkMediumEmphasis,
            },
            dot: {
                backgroundColor: ColorPicker.newProgressBar
            },
            root: {
                backgroundColor: ColorPicker.surface0
            }
        }
    }
    
    });
    const [step, setStep] = React.useState(0);
    const [autoPlay, setAutoPlay] = React.useState(true);
    const beforeChange = (nextSlide) => {
        nextSlide = (nextSlide+1) % 3
        setStep(nextSlide);
    }

    const stopCarouselAutoLoopEvent = () => {
      setAutoPlay(false);
    }
    const startCarouselAutoLoopEvent = () => {
      setAutoPlay(true);
    }



  return (
    
    <div style={{position:'relative', margin:"1.5rem 0"}}
      onMouseEnter={stopCarouselAutoLoopEvent}
      onMouseDown={stopCarouselAutoLoopEvent}
      onTouchStart={stopCarouselAutoLoopEvent}
      onMouseUp={startCarouselAutoLoopEvent}
      onMouseLeave={startCarouselAutoLoopEvent}
      onTouchEnd={startCarouselAutoLoopEvent}>
    <Carousel
      responsive={responsive}
      infinite={true}
      autoPlay={autoPlay}
      beforeChange={beforeChange}
      arrows={false}
      
      
    >
      {photos.map((photo, index) => (
        <div key={index} className="carousel-item">
          <img src={photo} alt={`Slide ${index}`} />
        </div>
      ))}
    </Carousel>
    <FlexView column hAlignContent="center" style={{ paddingBottom: "5%", paddingTop: "2%" }}>
        <MuiThemeProvider theme={theme1}>
            <MobileStepper
                variant="dots"
                steps={3}
                position="static"
                activeStep={step}
            />
        </MuiThemeProvider>
    </FlexView>
    </div>
  );
};

GiftCardPhotoCarousel.propTypes = {
  photos : PropTypes.arrayOf(PropTypes.string)
}
export default GiftCardPhotoCarousel;