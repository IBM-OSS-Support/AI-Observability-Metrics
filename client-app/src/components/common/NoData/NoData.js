import React from 'react';
import './_nodata.scss';
const NoData = () => {
  return (
    <div className="iec--empty-state__wrapper">
      <div aria-hidden="true" className="iec--empty-state__icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
          <defs>
            <linearGradient id="prefix__a_dark_box_illustration-FmZVS" x1="11.12" y1="43.34" x2="40" y2="43.34" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#393939"></stop>
              <stop offset="1" stopColor="#262626"></stop>
            </linearGradient>
            <linearGradient id="prefix__b_dark_box_illustration-FmZVS" x1="40" y1="43.34" x2="68.88" y2="43.34" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#161616"></stop>
              <stop offset="1" stopColor="#262626"></stop>
            </linearGradient>
            <linearGradient id="prefix__c_dark_box_illustration-FmZVS" x1="32.78" y1="30.83" x2="47.22" y2="5.83" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#525252"></stop>
              <stop offset="1" stopColor="#393939"></stop>
            </linearGradient>
          </defs>
          <path fill="none" d="M0 0h80v80H0z"></path>
          <path opacity="0.25" d="M40 78.34L11.13 61.67 40 45.01l28.86 16.66L40 78.34z"></path>
          <path fill="url(#prefix__a_dark_box_illustration-FmZVS)" d="M40 68.35L11.12 51.68l.01-33.35L40 34.99v33.36z"></path>
          <path fill="url(#prefix__b_dark_box_illustration-FmZVS)" d="M68.88 51.68L40 68.35V34.99l28.87-16.66.01 33.35z"></path>
          <path fill="url(#prefix__c_dark_box_illustration-FmZVS)" d="M40 34.99L11.13 18.33 40 1.66l28.87 16.67L40 34.99z"></path>
          <path fill="#262626" d="M25.97 26.67l28.67-16.55-.42-.24-28.68 16.56.43.23z"></path>
          <path fill="#6f6f6f" d="M40 35.24L11.13 18.57v-.24l.21-.12 28.87 16.67-.21.11v.25z"></path>
          <path fill="#525252" d="M21.49 33.33l-8.2-4.73.01-5.69 8.19 4.74v5.68z"></path>
        </svg>
      </div>
      <div className="iec--empty-state__text-wrapper">
        <p className="iec--empty-state__text cds--type-heading-03">No Data Available</p>
        <p className="iec--empty-state__text cds--type-body-01">You do not have any data available for these configuration.</p>
      </div>
    </div>
  );
};

export default NoData;
