/* ******************************************************************************
 * IBM Confidential
 *
 * OCO Source Materials
 *
 *  Copyright IBM Corp. 2024  All Rights Reserved.
 *
 * The source code for this program is not published or otherwise divested
 * of its trade secrets, irrespective of what has been deposited with the
 * U.S. Copyright Office.
 ****************************************************************************** */
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { ComboBox, Button } from "@carbon/react";
import DatePicker from 'react-datepicker'; // Make sure to import your DatePicker from react-datepicker
import "react-datepicker/dist/react-datepicker.css"; // Include styles for DatePicker

const Filter = ({ onFilterChange }) => {
  const [messageFromServerFilter, setMessageFromServerFilter] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemUser, setSelectedItemUser] = useState(null);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);
  const [lastEndDate, setLastEndDate] = useState(null);
  const [datePickerKey, setDatePickerKey] = useState(0);

  const uniqueId = `header-filter-${Math.random().toString(36).substr(2, 9)}`;

  const userComboBoxRef = useRef(null);
  const appComboBoxRef = useRef(null);

  const fetchFilterData = useCallback(async () => {
    const apiUrl = process.env.REACT_APP_BACKEND_API_URL;
    const query = 'SELECT application_name, app_user, timestamp FROM log_history ORDER BY app_user ASC';

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

  useEffect(() => {
    const hideCloseIcon = (ref) => {
      if (ref.current) {
        const clearButtons = ref.current.querySelectorAll('.bx--list-box__selection--clear');
        clearButtons.forEach(button => {
          button.style.display = 'none';
        });
      }
    };

    hideCloseIcon(userComboBoxRef);
    hideCloseIcon(appComboBoxRef);
  }, [userComboBoxRef.current, appComboBoxRef.current]);

  // Scroll effect to display title
  useEffect(() => {
    const handleScroll = () => {
      const filterTitle = document.getElementById('filter-title');
      const filterWrapper = document.getElementById('filter-wrapper');
      if (window.scrollY > 50) {
        filterTitle.classList.remove('hidden');
        filterTitle.classList.add('visible');
        filterWrapper.classList.add('scroll');
      } else {
        filterTitle.classList.remove('visible');
        filterTitle.classList.add('hidden');
        filterWrapper.classList.remove('scroll');
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const users = messageFromServerFilter.length > 0
    ? [...new Set(messageFromServerFilter.map(app => app.app_user))]
    : ["No users available"];

  const handleSelectUser = useCallback((event, data = messageFromServerFilter) => {
    const selectedUser = event.selectedItem;
    setSelectedItemUser(selectedUser);

    if (!selectedUser) {
      setSelectedItem(null);
      setFilteredApplications([]);
      onFilterChange(null, null, null, null);
    } else {
      const appsForUser = data
        .filter(app => app.app_user === selectedUser)
        .map(app => app.application_name);

      setFilteredApplications([...new Set(appsForUser)]);
      setSelectedItem(null);
      onFilterChange(selectedItem, selectedUser, dateRange[0], dateRange[1]); // Keep the dates
    }
  }, [selectedItem, selectedItemUser, messageFromServerFilter, dateRange, onFilterChange]);

  const handleSelectApplication = useCallback((event) => {
    const selectedApp = event.selectedItem;
    setSelectedItem(selectedApp);
    onFilterChange(selectedApp, selectedItemUser, dateRange[0], dateRange[1]); // Keep the dates
  }, [selectedItemUser, dateRange, onFilterChange]);

  const handleDateChange = (update) => {
    if (Array.isArray(update) && update.length === 2) {
      setDateRange(update);
      onFilterChange(selectedItem, selectedItemUser, update[0] || null, update[1] || null);
    }
  };

  const handleClearAll = () => {
    setSelectedItem(null);
    setSelectedItemUser(null);
    setDateRange([null, null]);
    setFilteredApplications([]);
    onFilterChange(null, null, null, null);
    setDatePickerKey(prevKey => prevKey + 1); // Force re-render of DatePicker
  };

  const applicationOptions = filteredApplications.length > 0 ? filteredApplications : ["Select a user first"];

  return (
    <div className="header-filter-wrapper" id='filter-wrapper'>
      <div className="filter-title hidden" id="filter-title">
        Filter
      </div>
      <div className="header-filter flex">
        <ComboBox
          ref={userComboBoxRef}
          key={`user-${selectedItemUser}`} 
          id={`${uniqueId}-user`}
          selectedItem={selectedItemUser}
          onChange={handleSelectUser}
          items={users}
          placeholder="Choose User Name"
          size="md"
        />
        <ComboBox
          ref={appComboBoxRef}
          key={`app-${selectedItem}`} 
          id={`${uniqueId}-app`}
          selectedItem={selectedItem}
          onChange={handleSelectApplication}
          items={applicationOptions}
          placeholder="Choose Application Name"
          size="md"
        />
        <DatePicker
          key={datePickerKey}
          className='date-range-selector cds--date-picker'
          selectsRange={true}
          startDate={dateRange[0]}
          endDate={dateRange[1]}
          onChange={handleDateChange}
          placeholderText="Select date range"
          dateFormat="dd/MMM/YYY"
          onKeyDown={(e) => e.preventDefault()}
        />
        {(selectedItem || selectedItemUser || dateRange[0] || dateRange[1]) && (
          <Button
            kind="danger--ghost"
            onClick={handleClearAll}
            className="clear-all-button"
          >
            Clear All
          </Button>
        )}
      </div>
    </div>
  );
};

export default Filter;
