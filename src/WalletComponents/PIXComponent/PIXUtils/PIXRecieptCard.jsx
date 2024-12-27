import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import PropTypes from "prop-types";

const useStyles = makeStyles(() => ({
    root: {
        color: "#001428",
        backgroundColor: "#dbdbdb",
        padding: "3px",
        fontWeight: "400",
        width: "100%",
        height: "180",
        boxShadow: "none",
        textAlign: 'center',
        textTransform: 'none',
        '&:hover': {
            backgroundColor: "",
        },
    },
    amount:{
        fontSize: "2.1 rem",
        lineHeight: "2.4rem",
        fontWeight: "400"
    },
    date :{
        fontSize: "0.8 rem",
        lineHeight: "1.429 rem",
        fontWeight: "400"
    },
    text : {
        fontSize: "1 rem",
        lineHeight: "1.75 rem",
        fontWeight: "400"
    }
  }));

export default function PIXRecieptComponent(props) {
    const classes = useStyles();

    return (
        <div>
            <Card className= {classes.root}>
                <div className= {classes.amount}>
                {props.data.amount}
                </div>
                <div className= {classes.text}>
                {`PIX- ${props.data.type}-${props.data.name}`}
                </div>
                <div className= {classes.date}>
                {props.data.date}
                </div>
            </Card>
       </div>
    );
}

PIXRecieptComponent.propTypes = {
    data: PropTypes.object,
}