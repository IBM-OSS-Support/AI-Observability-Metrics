import React, { useEffect, useState } from 'react';
import { Dropdown } from "@carbon/react";


const Filter = () => {
  
    return (
        <div className="header-filter flex">
        <Dropdown
        items={['Option 1', 'Option 2', 'Option 3']}
        label="Choose Deployment Name"
        size="md"
        />
        <Dropdown
        items={['User 1', 'User 2', 'User 3']}
        label="Choose User Name"
        size="md"
        />
        <Dropdown
        items={['Timestamp 1', 'Timestamp 2', 'Timestamp 3']}
        label="Choose Time Window"
        size="md"
        />
    </div>
    );
  };
  
  export default Filter;