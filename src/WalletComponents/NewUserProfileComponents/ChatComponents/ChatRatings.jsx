import React, { useEffect } from 'react';
import PropTypes from "prop-types";
import StarIcon from "@material-ui/icons/Star";
import StarBorderIcon from "@material-ui/icons/StarBorder";
import Box from "@material-ui/core/Box";
import ColorPicker from "../../../Services/ColorPicker";
import localeService from "../../../Services/localeListService";

var localeObj = {};
function ChatRatings(props) {

  const { ratings } = props;
  const maxStars = 5;
  useEffect(() => {
    if (Object.keys(localeObj).length === 0) {
        localeObj = localeService.getActionLocale();
    }
  }, []);

  const onClickhandleRating = (e, alreadyRated) => {
    props.handleRating(e, props.ticketId, props.ticketNumber, alreadyRated, props.index, ratings);
  }

  const getStars = () => {
    const stars = [];
    for (let i = 1; i <= maxStars; i++) {
      stars.push(
        <Box key={i} display="inline-block" marginRight={1}>
          {i <= ratings ? <StarIcon style={{ color: ColorPicker.accent, width: "0.938rem", height:"0.891rem" }} /> : <StarBorderIcon style={{ opacity: "20%", width: "1rem", height:"1rem", color: ColorPicker.darkHighEmphasis }} />}
        </Box>
      );
    }
    return stars;
  };

  return (
    <div>
        {ratings === 0  ? (
            <button className="body2 highEmphasis" onClick={(e) => onClickhandleRating(e, false)} style={{width:"13.188rem", height:"2.25rem", background:"transparent", borderColor: ColorPicker.openInvoiceBlue, borderStyle: "solid", borderRadius: "1.125rem", color: ColorPicker.darkHighEmphasis, display:"flex", alignItems:"center", justifyContent:"center"}}> <StarBorderIcon style={{width: "0.833rem", height: "0.792rem", marginRight:"0.583rem"}}/> {props.rateCustomerService} </button>
        ) : (
            <button onClick={(e) => onClickhandleRating(e, true)} style={{width:"13.188rem", height:"2.25rem", background:"transparent", borderColor: ColorPicker.openInvoiceBlue, borderStyle: "solid", borderRadius: "1.125rem", display:"flex", alignItems:"center", justifyContent:"center"}}>
                {getStars()}
            </button>
        )}
    </div>
  );
}

ChatRatings.propTypes = {
  ratings: PropTypes.number.isRequired,
  handleRating: PropTypes.func,
  ticketId: PropTypes.string,
  ticketNumber: PropTypes.string,
  index: PropTypes.number.isRequired,
  rateCustomerService: PropTypes.string
};

export default ChatRatings;