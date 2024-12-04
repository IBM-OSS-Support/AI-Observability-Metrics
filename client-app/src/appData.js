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

import axios from 'axios';
import appData from './constants/appdata.json'
import traceablityData from './constants/traceabilityservices.json'

let data, traceData = [];
const API_BASE_URL = process.env.REACT_APP_BACKEND_API_URL

export const getAppData = () => {
  
  data = appData.sort((a, b) => b.data.upload_ms - a.data.upload_ms);
  return data;
}

export const getTraceablityData = () => {
  
  traceData = traceablityData.sort((a, b) => b.traceData.upload_ms - a.traceData.upload_ms);
  return traceData;
}

export const fetchAppData = async (setStore) => {
  try {
    setStore('status', 'loading');
    const { data: apiData } = await axios.get(`${API_BASE_URL}/roja-metrics`);
    data = apiData.sort((a, b) => b.data.upload_ms - a.data.upload_ms);
    setStore('status', 'success');
  } catch (err) {
    setStore('status', 'success');
    data = appData.sort((a, b) => b.data.upload_ms - a.data.upload_ms);
  }
}
