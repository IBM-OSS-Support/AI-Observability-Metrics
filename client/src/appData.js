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

let data = [];
const API_BASE_URL = process.env.NODE_ENV === 'development' ? '' : 'http://9.30.147.134:3001';

export const getAppData = () => {
  return data;
}

export const fetchAppData = async (setStore) => {
  try {
    setStore('loaded', false);
    const { data: apiData } = await axios.get(`${API_BASE_URL}/roja-metrics`);
    data = apiData;
    setStore('loaded', true);
    setStore('status', 'success');
  } catch (err) {
    setStore('status', 'success');
    setStore('loaded', true);
    console.log('fetch app data error: ', err);
    data = appData;
  }
}
