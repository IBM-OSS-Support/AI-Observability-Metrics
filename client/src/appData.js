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

// const formatMetricData = (metrics) => {
//   let performance = {};
//   for (const item of metrics) {
//     if (item.scope === 'performance' && item.name === 'call_count') {
//       performance[item.updateTs] = {
//         count: Number(performance[item.updateTs]?.count || 0) + Number(item.counter || 0)
//       }
//     }
//   };

//   console.log(performance);
// }


export const fetchAppData = async () => {
  try {
    // await axios.post(`${API_BASE_URL}/run-roja-script`);
    const { data: apiData } = await axios.get(`${API_BASE_URL}/roja-metrics`);
    const metricsData = apiData.map(({ data }) => data);
    // const response = require('./response.json');
    // formatMetricData(response.metrics);
    console.log(metricsData);
    data = metricsData;
    return data;
  } catch (err) {
    console.log('fetch app data error: ', err);
    return appData.map(({data}) => data);
  }
}
