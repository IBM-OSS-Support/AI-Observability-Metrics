/* ******************************************************************************
 * IBM Confidential
 *
 * OCO Source Materials
 *
 *  Copyright IBM Corp. 2023  All Rights Reserved.
 *
 * The source code for this program is not published or otherwise divested
 * of its trade secrets, irrespective of what has been deposited with
 * the U.S. Copyright Office.
 ****************************************************************************** */
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { ComboBox, DatePicker, DatePickerInput } from "@carbon/react";

const Filter = ({ onFilterChange }) => {
  const [messageFromServerFilter, setMessageFromServerFilter] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemUser, setSelectedItemUser] = useState(null);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [selectedTimestampRange, setSelectedTimestampRange] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const uniqueId = useRef(`header-filter-${Math.random().toString(36).substr(2, 9)}`).current;

  // Function to fetch data from API
  const fetchFilterData = useCallback(async () => {
    const apiUrl = process.env.REACT_APP_BACKEND_API_URL; // Ensure you have the correct API URL here
    const query = 'SELECT application_name, app_user, timestamp FROM maintenance';

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setMessageFromServerFilter(data);
      handleSelectUser({ selectedItem: selectedItemUser }, data); // Ensure user selection logic is updated with new data
    } catch (error) {
      console.error('Error fetching filter data:', error);
    }
  }, [selectedItemUser]);

  useEffect(() => {
    // Fetch the filter data when the component mounts
    fetchFilterData();
  }, [fetchFilterData]);

  const users = messageFromServerFilter.length > 0
    ? [...new Set(messageFromServerFilter.map(app => app.app_user))]
    : ["No users available"];

  const handleSelectUser = useCallback((event, data = messageFromServerFilter) => {
    const selectedUser = event.selectedItem;

    if (selectedUser !== selectedItemUser) {
      setSelectedItemUser(selectedUser);

      const appsForUser = data
        .filter(app => app.app_user === selectedUser)
        .map(app => app.application_name);

      setFilteredApplications([...new Set(appsForUser)]);
      onFilterChange(selectedItem, selectedUser, selectedTimestampRange, startDate, endDate);
    }
  }, [selectedItemUser, messageFromServerFilter, selectedItem, selectedTimestampRange, startDate, endDate, onFilterChange]);

  const handleSelectApplication = useCallback((event) => {
    const selectedApp = event.selectedItem;

    if (selectedApp !== selectedItem) {
      setSelectedItem(selectedApp);
      onFilterChange(selectedApp, selectedItemUser, selectedTimestampRange, startDate, endDate);
    }
  }, [selectedItem, selectedItemUser, selectedTimestampRange, startDate, endDate, onFilterChange]);

  const handleDateChange = (range) => {
    const [start, end] = range;
    setStartDate(start);
    setEndDate(end);

    const numberOfDaysSelected = calculateDaysDifference(start, end);
    console.log("numberOfDaysSelected", numberOfDaysSelected);

    onFilterChange(selectedItem, selectedItemUser, selectedTimestampRange, start, end, numberOfDaysSelected);
  };

  const calculateDaysDifference = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  const applicationOptions = filteredApplications.length > 0
    ? filteredApplications
    : ["Select a user first"];

  const handleSelectTimestampRange = (event) => {
    const selectedRange = event.selectedItem;
    setSelectedTimestampRange(selectedRange);
    onFilterChange(selectedItem, selectedItemUser, selectedRange, startDate, endDate);
  };

  const timestampRangeOptions = [
    { label: 'Last 24 hours', value: 'last24hours' },
    { label: 'Last 7 days', value: 'last7days' },
    { label: 'Last 30 days', value: 'last30days' },
  ];

  return (
    <div className="header-filter flex">
      <ComboBox
        id={`${uniqueId}-user`}
        selectedItem={selectedItemUser}
        onChange={handleSelectUser}
        items={users}
        placeholder="Choose User Name"
        size="md"
        onFocus={fetchFilterData} // Trigger fetch when user interacts
      />
      <ComboBox
        id={`${uniqueId}-app`}
        selectedItem={selectedItem}
        onChange={handleSelectApplication}
        items={applicationOptions}
        placeholder="Choose Application Name"
        size="md"
      />
      <DatePicker
        id={`${uniqueId}-date`}
        datePickerType="range"
        onChange={handleDateChange}
        dateFormat="m/d/Y"
        placeholder="Choose Date Range"
        size="md"
      >
        <DatePickerInput
          id={`${uniqueId}-start`}
          placeholder="Timestamp Start Date"
          labelText=""
          pattern="\d{1,2}/\d{1,2}/\d{4}"
        />
        <DatePickerInput
          id={`${uniqueId}-end`}
          placeholder="Timestamp End Date"
          labelText=""
          pattern="\d{1,2}/\d{1,2}/\d{4}"
        />
      </DatePicker>
    </div>
  );
};

export default Filter;