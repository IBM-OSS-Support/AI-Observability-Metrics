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

import moment from "moment";
import { getAppData } from "../appData";

const convertTagsArrToObj = (tags) => {
  return tags.reduce((acc, tag) => {
    acc[tag.key] = tag.value;
    return acc;
  }, {});
}

const getLatencyValues = (histogram) => {
  if (!histogram || !histogram.bins) {
    return {};
  }

  const totalTime = histogram.bins.reduce((acc, time) => {
    return acc + Number(time);
  }, 0);
  
  const totalCount = histogram.counts.reduce((acc, count) => {
    return acc + Number(count);
  }, 0);
  
  return {
    latency: totalTime / 1000000000,
    count: totalCount
  }
}

const formatMetrics = (metrics = []) => {
  let obj = {};
  for (const item of metrics) {
    switch (item.name) {
      case 'token_count':
      case 'call_count': {
        const countObj = {
          count: Number(item.counter),
          tags: convertTagsArrToObj(item.tags)
        };

        if (obj[item.name]) {
          obj[item.name].push(countObj);
        } else {
          obj[item.name] = [ countObj ];
        }

        break;
      }

      case 'latency': {
        const latencyObj = {
          ...getLatencyValues(item.histogram),
          tags: convertTagsArrToObj(item.tags)
        }

        if (obj[item.name]) {
          obj[item.name].push(latencyObj);
        } else {
          obj[item.name] = [ latencyObj ];
        }

        break;
      }
      default: break;
    }
  }

  return obj;
}

export const getMetricsData = () => {
  const appData = getAppData();
  const data = {};
  let startTime, endTime;
  
  for (const app of appData) {
    const metricsObj = formatMetrics(app.data.metrics);
    
    if (!startTime || moment(app.timestamp).isBefore(moment(startTime))) {
      startTime = moment(app.timestamp).valueOf();
    }

    if (!endTime || moment(app.timestamp).isAfter(moment(endTime))) {
      endTime = moment(app.timestamp).valueOf();
    }

    data[app.id] = {
      id: app.id,
      name: app.application_name,
      time: moment(app.timestamp).format(),
      ...metricsObj
    }
  }

  return {
    startTime,
    endTime,
    apps: data
  };
}
