/* ******************************************************************************
 * IBM Confidential
 *
 * OCO Source Materials
 *
 *  Copyright IBM Corp. 2024  All Rights Reserved.
 *
 * The source code for this program is not published or otherwise divested
 * of its trade secrets, irrespective of what has been deposited with
 * the U.S. Copyright Office.
 ****************************************************************************** */

import React, { createContext, useContext, useState } from "react";

const StoreContext = createContext({});

export const useStoreContext = () => {
  return useContext(StoreContext);
}

export const StoreProvider = ({ children }) => {
  const [state, setState] = useState({});

  const setStore = (key, newValue) => {
    setState({
      ...state,
      [key]: newValue
    })
  };

  return (
    <StoreContext.Provider 
      value={{
        state,
        setStore
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}

export default StoreContext;
