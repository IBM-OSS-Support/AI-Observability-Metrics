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

import { getIntervals } from '../../../Metrics/Performance/helper';

export const getTimelineChartData = ({ apps, startTime, endTime }) => {
  let obj = {};

  const intervals = getIntervals(startTime, endTime, 10);

  for (const i in intervals) {
    let { start, end } = intervals[i];
    start = moment(start);
    end = moment(end);

    for (const appId in apps) {
      const app = apps[appId];
      const appTime = moment(app.time);

      if (appTime.isSameOrAfter(start) && appTime.isSameOrBefore(end)) {
        if (obj[i]) {
          obj[i].value = obj[i].value + 1;
        } else {
          obj[i] = {
            group: 'Dataset1',
            key: app.time,
            value: 1
          }
        }
      }
    }
  }

  return Object.values(obj);
}