import React from 'react';

import "../../styles/lazyLoad.css";

export default function LoadingGrid() {
    return (
        <div style={{ marginLeft: "5%", marginRight: "5%" }}>
            <div className="shimmer-container">
                <section className="shimmer-card-wraper">
                    <div className="shimmer-bar-3 shimming"></div>
                    <div className="shimmer-bar-2 shimming"></div>
                    <div className="shimmer-bar-2 shimming"></div>
                </section>
                <section className="shimmer-card-wraper">
                    <div className="shimmer-bar-4 shimming"></div>
                </section>
            </div>
        </div>
    );
}
