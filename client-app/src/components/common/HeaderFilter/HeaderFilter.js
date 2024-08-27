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
import React, { useEffect, useState, useRef } from 'react';
import { ComboBox, DatePicker, DatePickerInput } from "@carbon/react";

const Filter = ({ onFilterChange }) => {
  const [websocket, setWebsocket] = useState(null);
  const [messageFromServerFilter, setMessageFromServerFilter] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemUser, setSelectedItemUser] = useState(null);
  const [filteredApplications, setFilteredApplications] = useState([]); 
  const [selectedTimestampRange, setSelectedTimestampRange] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const uniqueId = useRef(`header-filter-${Math.random().toString(36).substr(2, 9)}`).current;

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080');
    setWebsocket(ws);
    return () => {
      ws.close();
    };
  }, []);

  const sendMessageToServerFilter = () => {
    const q = 'SELECT application_name, app_user, timestamp FROM maintenance';
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      const message = {
        tab: 'auditing',
        action: q
      };
      websocket.send(JSON.stringify(message));
    }
  };

  useEffect(() => {
    if (websocket) {
      websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setMessageFromServerFilter(data);
        handleSelectUser({ selectedItem: selectedItemUser }, data);
      };
    }
  }, [websocket, selectedItemUser]);

  const users = messageFromServerFilter.length > 0 
    ? [...new Set(messageFromServerFilter.map(app => app.app_user))] 
    : ["No users available"];

  const handleSelectUser = (event, data = messageFromServerFilter) => {
    const selectedUser = event.selectedItem;
    setSelectedItemUser(selectedUser);

    const appsForUser = data
      .filter(app => app.app_user === selectedUser)
      .map(app => app.application_name);

    setFilteredApplications([...new Set(appsForUser)]);
    onFilterChange(selectedItem, selectedUser, selectedTimestampRange, startDate, endDate);
  };

  const handleSelectApplication = (event) => {
    const selectedApp = event.selectedItem;
    setSelectedItem(selectedApp);
    onFilterChange(selectedApp, selectedItemUser, selectedTimestampRange, startDate, endDate);
  };

  const handleDateChange = (range) => {
    const [start, end] = range;
    setStartDate(start);
    setEndDate(end);

    // Calculate number of days selected
    const numberOfDaysSelected = calculateDaysDifference(start, end);

    console.log("numberOfDaysSelected", numberOfDaysSelected);
    
    // Pass number of days selected to the parent component or use as needed
    onFilterChange(selectedItem, selectedItemUser, selectedTimestampRange, start, end, numberOfDaysSelected);
  };

  const calculateDaysDifference = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Calculate the difference in time
    const timeDiff = end.getTime() - start.getTime();

    // Convert time difference from milliseconds to days
    const daysDiff = timeDiff / (1000 * 3600 * 24);

    return Math.ceil(daysDiff); // Round up to the nearest whole number
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
        onFocus={sendMessageToServerFilter}
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
