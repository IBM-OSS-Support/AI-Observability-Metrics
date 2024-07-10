import React, { useEffect, useState } from 'react';
import { Dropdown } from "@carbon/react";


const Filter = () => {
    
    const [websocket, setWebsocket] = useState(null);
    const [messageFromServerFilter, setMessageFromServerFilter] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedItemUser, setSelectedItemUser] = useState(null);
  

    // Connect to WebSocket server on component mount
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080');
    setWebsocket(ws);
    // Cleanup function to close WebSocket connection on component unmount
    return () => {
      ws.close();
    };
  }, []);

  // Function to send message to WebSocket server
  const sendMessageToServerFilter = (messageFromServerLog) => {
    var q = 'SELECT application_name,app_user FROM maintenance';
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      const message = {
        tab: 'auditing',
        action: q
      };
      websocket.send(JSON.stringify(message));
    }
  };

  // Listen for messages from WebSocket server
  useEffect(() => {
    if (websocket) {
      websocket.onmessage = (event) => {
        setMessageFromServerFilter(JSON.parse(event.data));
      };
    
    }
  }, [websocket]);

  console.log('Filter messageFromServerFilter', messageFromServerFilter);
  console.log('Filter Type',typeof(messageFromServerFilter));
  
      if (messageFromServerFilter) {
        var applicationNames = messageFromServerFilter.map(app => app.application_name);
        var users = messageFromServerFilter.map(app => app.app_user);
        console.log(applicationNames);
      }

      const uniqueApplicationNames = [...new Set(applicationNames)];
      const uniqueUsers = [...new Set(users)];
      
  const deploymentOptions = messageFromServerFilter ? uniqueApplicationNames : ["Select"];
  const userOptions = messageFromServerFilter ? uniqueUsers : ["Select"];

  const handleSelect = (event) => {
    setSelectedItem(event.selectedItem); // Update state with selected item
    console.log("Selected item:", event.selectedItem);
  };

  const handleSelectUser = (e) => {
    setSelectedItemUser(e.selectedItemUser); // Update state with selected item
    console.log("Selected item:", e.selectedItemUser);
  };

    return (
        <div className="header-filter flex">
        <Dropdown
        onFocus={sendMessageToServerFilter}
        selectedItem={selectedItem} // Controlled component setup
        onChange={handleSelect}
        items={deploymentOptions}
        label="Choose Deployment Name"
        size="md"
        />
        <Dropdown
        onFocus={sendMessageToServerFilter}
        selectedItemUser={selectedItemUser} // Controlled component setup
        onChange={handleSelectUser}
        items={userOptions}
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