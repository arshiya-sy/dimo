// YouTubeEmbed.js
import React from 'react';
import YouTube from 'react-youtube';

const YouTubeEmbed = ({ videoId }) => {

    let screenWidth = window.innerWidth
    const opts = {
        height: window.innerHeight * 0.72,
        width: window.innerWidth,
        margin: "auto",
        playerVars: {
            autoplay: 1,
            rel: 0,
            loop: 1,
            playlist: videoId,
            showinfo: 0,
            modestbranding: 1,
            start: 0
        },
    };

    return <YouTube videoId={videoId} opts={opts} />;
};

export default YouTubeEmbed;
