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

const formatMetrics = (metrics = []) => {
  let obj = {};
  for (const item of metrics) {
    if (item.name === 'call_count') {
      const callCountObj = {
        count: Number(item.counter),
        tags: convertTagsArrToObj(item.tags)
      };

      if (obj[item.name]) {
        obj[item.name].push(callCountObj);
      } else {
        obj[item.name] = [ callCountObj ];
      }
    }
  }

  return obj;
}

export const getMetricsData = () => {
  const appData = getAppData();
  const data = {};
  
  for (const app of appData) {
    const metricsObj = formatMetrics(app.data.metrics);
    data[app.id] = {
      id: app.id,
      name: app.application_name,
      time: moment(app.timestamp).toDate(),
      ...metricsObj
    }
  }

  return data;
}
