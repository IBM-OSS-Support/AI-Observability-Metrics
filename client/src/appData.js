import axios from 'axios';

let data = {};
const API_BASE_URL = 'http://9.30.147.134:3001';

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
    const metricsData = apiData[0].data;
    // const response = require('./response.json');
    // formatMetricData(response.metrics);
    console.log(metricsData);
    data = metricsData;
  } catch (err) {
    console.log('fetch app data error: ', err);
  }
}
