import React, { useEffect, useState } from 'react';
import { ComboBox } from "@carbon/react";

const Filter = ({ onFilterChange }) => {
  const [websocket, setWebsocket] = useState(null);
  const [messageFromServerFilter, setMessageFromServerFilter] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemUser, setSelectedItemUser] = useState(null);
  const [filteredApplications, setFilteredApplications] = useState([]); 
  const [selectedTimeWindow, setSelectedTimeWindow] = useState(null);

  const [selectedTimestampRange, setSelectedTimestampRange] = useState(null);


  const generateUniqueId = () => `header-filter-${Math.random().toString(36).substr(2, 9)}`;

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
  }, [websocket]);

  console.log('Filter messageFromServerFilter', messageFromServerFilter);

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

    onFilterChange(selectedItem, selectedUser, selectedTimeWindow);
  };

  const handleSelectApplication = (event) => {
    const selectedApp = event.selectedItem;
    setSelectedItem(selectedApp);

    onFilterChange(selectedApp, selectedItemUser, selectedTimeWindow);
  };

  // const handleSelectTimeWindow = (event) => {
  //   const selectedWindow = event.selectedItem;
  //   setSelectedTimeWindow(selectedWindow);

  //   onFilterChange(selectedItem, selectedItemUser, selectedWindow);
  // };

  const applicationOptions = filteredApplications.length > 0 
    ? filteredApplications 
    : ["Select a user first"];

  // const timeWindowOptions = ['Last Day', 'Last 5 Days', 'Last 10 Days'];

  const handleSelectTimestampRange = (event) => {
    const selectedRange = event.selectedItem;
    setSelectedTimestampRange(selectedRange);
    onFilterChange(selectedItem, selectedItemUser, selectedTimeWindow, selectedTimestampRange);
  };

  const timestampRangeOptions = [
    { label: 'Last 24 hours', value: 'last24hours' },
    { label: 'Last 7 days', value: 'last7days' },
    { label: 'Last 30 days', value: 'last30days' },
  ];

  // Generate a unique ID dynamically
  const uniqueId = generateUniqueId();

  return (
    <div className="header-filter flex">
      <ComboBox
        id={uniqueId}
        selectedItem={selectedItemUser}
        onChange={handleSelectUser}
        items={users}
        placeholder="Choose User Name"
        size="md"
        onFocus={sendMessageToServerFilter}
      />
      <ComboBox
        id={uniqueId}
        selectedItem={selectedItem}
        onChange={handleSelectApplication}
        items={applicationOptions}
        placeholder="Choose Application Name"
        size="md"
      />
      <ComboBox
        id={uniqueId}
        selectedItem={selectedTimestampRange}
        onChange={handleSelectTimestampRange}
        items={timestampRangeOptions}
        placeholder="Choose Timestamp Range"
        size="md"
      />
    </div>
  );
};

export default Filter;
