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
import React, { useEffect, useState, useCallback } from 'react';
import { ComboBox, DatePicker, DatePickerInput, Button } from "@carbon/react";

const Filter = ({ onFilterChange }) => {
  const [messageFromServerFilter, setMessageFromServerFilter] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemUser, setSelectedItemUser] = useState(null);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [lastEndDate, setLastEndDate] = useState(null); // Added state to store last end date

  const uniqueId = `header-filter-${Math.random().toString(36).substr(2, 9)}`;

  const fetchFilterData = useCallback(async () => {
    const apiUrl = process.env.REACT_APP_BACKEND_API_URL;
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
      handleSelectUser({ selectedItem: selectedItemUser }, data);
    } catch (error) {
      console.error('Error fetching filter data:', error);
    }
  }, [selectedItemUser]);

  useEffect(() => {
    fetchFilterData();
  }, [fetchFilterData]);

  const users = messageFromServerFilter.length > 0
    ? [...new Set(messageFromServerFilter.map(app => app.app_user))]
    : ["No users available"];

  const handleSelectUser = useCallback((event, data = messageFromServerFilter) => {
    const selectedUser = event.selectedItem;

    if (selectedUser !== selectedItemUser) {
      setSelectedItemUser(selectedUser);

      if (!selectedUser) {
        // Clear all filters if user is cleared
        setSelectedItem(null);
        setStartDate(null);
        setFilteredApplications([]);
        onFilterChange(null, null, null, null);
      } else {
        const appsForUser = data
          .filter(app => app.app_user === selectedUser)
          .map(app => app.application_name);

        setFilteredApplications([...new Set(appsForUser)]);
        onFilterChange(selectedItem, selectedItemUser, startDate, endDate);
      }
    }
  }, [selectedItemUser, messageFromServerFilter, selectedItem, startDate, endDate, onFilterChange]);

  const handleSelectApplication = useCallback((event) => {
    const selectedApp = event.selectedItem;
    setSelectedItem(selectedApp);
    onFilterChange(selectedApp, selectedItemUser, startDate, endDate);
  }, [selectedItemUser, startDate, endDate, onFilterChange]);

  const handleDateChange = (dateRange) => {
    if (Array.isArray(dateRange) && dateRange.length === 2) {
      const [start, end] = dateRange;
      setStartDate(start || null);
      setEndDate(end || null);
      onFilterChange(selectedItem, selectedItemUser, start || null, end || null);
    }
  };

  const handleClearAll = () => {
    // Store the last end date before clearing
    setLastEndDate(endDate);

    setSelectedItem(null);
    setSelectedItemUser(null);
    setStartDate(null); // Clear start date
    setEndDate(null);   // Clear end date
    setFilteredApplications([]);
    onFilterChange(null, null, null, null);
  };

  const handleStartDateClick = () => {
    // Reapply the stored end date when clicking start date
    if (startDate === null && lastEndDate !== null) {
      setEndDate(lastEndDate);
    }
  };

  const applicationOptions = filteredApplications.length > 0 ? filteredApplications : ["Select a user first"];

  return (
    <div className="header-filter flex">
      <ComboBox
        id={`${uniqueId}-user`}
        selectedItem={selectedItemUser}
        onChange={handleSelectUser}
        items={users}
        placeholder="Choose User Name"
        size="md"
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
        value={[startDate, endDate]}
        dateFormat="d/m/Y"
        size="md"
      >
        <DatePickerInput
          id={`${uniqueId}-start`}
          placeholder="Timestamp Start Date"
          labelText=""
          pattern="\d{1,2}/\d{1,2}/\d{4}"
          value={startDate ? new Date(startDate).toLocaleDateString() : ""}
          onChange={() => {}}
          onKeyDown={(e) => e.preventDefault()}
          readOnly
          onClick={handleStartDateClick} // Handle click to reapply end date
        />
        <DatePickerInput
          id={`${uniqueId}-end`}
          placeholder="Timestamp End Date"
          labelText=""
          pattern="\d{1,2}/\d{1,2}/\d{4}"
          value={endDate ? new Date(endDate).toLocaleDateString() : ""}
          onChange={() => {}}
          onKeyDown={(e) => e.preventDefault()}
          readOnly
        />
      </DatePicker>
      {(selectedItem || selectedItemUser || startDate || endDate) && (
        <Button
          kind="danger--ghost"
          onClick={handleClearAll}
          className="clear-all-button"
        >
          Clear All
        </Button>
      )}
    </div>
  );
};

export default Filter;
