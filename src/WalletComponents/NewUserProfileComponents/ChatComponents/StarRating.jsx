import React, { useState, useEffect } from 'react';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import ColorPicker from '../../../Services/ColorPicker';
import PropTypes from "prop-types";

  const StarRating = ({ onChange, displayRating }) => {
    const [rating, setRating] = useState(displayRating || 0);
    const starNames = ['Péssimo', 'Ruim', 'Regular', 'Bom', 'Ótimo']

    useEffect(() => {
      setRating(displayRating || 0);
    }, [displayRating]);

    const handleStarClick = (value) => {
      if (!displayRating) {
        setRating(value);
        if (onChange) {
          onChange(value);
        }
      }
    };

    return (
      <div style={{display: "flex", justifyContent: 'center', marginTop: '2.224rem', marginLeft: '1.125rem'}}>
        {[1, 2, 3, 4, 5].map((value, index) => (
            <div key={value} style={{ textAlign: 'center', marginRight: '1.388rem'}}>
                {rating >= value ? (
                    <StarIcon
                        onClick={() => handleStarClick(value)}
                        style={{ color: ColorPicker.accent, width: "2.237rem", height:"2.118rem", boxShadow: "none", outline: "none", border: "none"  }}
                    />
                ) : (
                    <StarBorderIcon
                        onClick={() => handleStarClick(value)}
                        style={{ color: 'rgb(69, 97, 125)', width: '2.237rem', height: '2.118rem', outline: 'none' }}
                    />
                )}
                <h2 className='CaptionBold highEmphasis' style={{opacity: value === rating ? '100%' : '21%'}}>{starNames[index]}</h2>
            </div>
        ))}
      </div>
    );
  }

  StarRating.propTypes = {
    onChange: PropTypes.func.isRequired,
    displayRating: PropTypes.number
  }

export default StarRating;