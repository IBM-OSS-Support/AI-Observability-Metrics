import React, { useEffect, useState, useCallback, useRef } from 'react';
import { ComboBox, DatePicker, DatePickerInput, Button } from "@carbon/react";

const Filter = ({ onFilterChange }) => {
  const [messageFromServerFilter, setMessageFromServerFilter] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemUser, setSelectedItemUser] = useState(null);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [lastEndDate, setLastEndDate] = useState(null);
  const [datePickerKey, setDatePickerKey] = useState(0);

  const uniqueId = `header-filter-${Math.random().toString(36).substr(2, 9)}`;

  const userComboBoxRef = useRef(null);
  const appComboBoxRef = useRef(null);

  const fetchFilterData = useCallback(async () => {
    const apiUrl = process.env.REACT_APP_BACKEND_API_URL;
    const query = 'SELECT application_name, app_user, timestamp FROM maintenance ORDER BY app_user ASC';

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
        filterWrapper.classList.add('scroll')
      } else {
        filterTitle.classList.remove('visible');
        filterTitle.classList.add('hidden');
        filterWrapper.classList.remove('scroll')
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
      setStartDate(null);
      setEndDate(null);
      setFilteredApplications([]);
      onFilterChange(null, null, null, null);
    } else {
      const appsForUser = data
        .filter(app => app.app_user === selectedUser)
        .map(app => app.application_name);

      setFilteredApplications([...new Set(appsForUser)]);
      setSelectedItem(null);
      onFilterChange(selectedItem, selectedUser, startDate, endDate);
    }
  }, [selectedItem, selectedItemUser, messageFromServerFilter, startDate, endDate, onFilterChange]);

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
      setLastEndDate(end || null); 

      onFilterChange(selectedItem, selectedItemUser, start || null, end || null);
    }
  };

  const handleClearAll = () => {
    setSelectedItem(null);
    setSelectedItemUser(null);
    setStartDate(null);
    setEndDate(null);
    setFilteredApplications([]);
    onFilterChange(null, null, null, null);

    // Force re-render of DatePicker to hide the open calendar
    setDatePickerKey(prevKey => prevKey + 1);
  };

  console.log('End date inside filter component', endDate);
  
  const applicationOptions = filteredApplications.length > 0 ? filteredApplications : ["Select a user first"];

  const handleKeyDown = (event, isSelected) => {
    if (event.key === 'Backspace' && isSelected) {
      event.preventDefault();
      console.log('called handleKeyDown');
    }
  };

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
          onKeyDown={(e) => handleKeyDown(e, !!selectedItemUser)} 
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
          onKeyDown={(e) => handleKeyDown(e, !!selectedItem)} 
        />
        <DatePicker
          key={datePickerKey}
          id={`${uniqueId}-date`}
          datePickerType="range"
          onChange={handleDateChange}
          value={[startDate ? new Date(startDate) : null, endDate ? new Date(endDate) : null]}
          dateFormat="d/m/y"
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
    </div>
  );
};

export default Filter;
