import React from 'react';
import "../../../styles/new_pix_style.css";

export default function CreditCardLoadingGrid() {

    return (
        <div className="shimmer-container">
            <section className="shimmer-card-wraper">
                <div className="shim-bar shimming"></div>
                <div className="shim-bar-1 shimming"></div>
                <div className="shim-bar-1 shimming"></div>
                <div style={{ marginTop: "1rem" }} className="shim-bar-1 shimming"></div>
                <div className="shim-bar-1 shimming"></div>
            </section>
            <section className="shimmer-card-wraper">
                <div className="shim-bar shimming"></div>
                <div className="shim-bar-1 shimming"></div>
                <div className="shim-bar-1 shimming"></div>
                <div style={{ marginTop: "1rem" }} className="shim-bar-1 shimming"></div>
                <div className="shim-bar-1 shimming"></div>
            </section>
        </div>
    );
}
