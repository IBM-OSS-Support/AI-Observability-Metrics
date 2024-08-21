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

export const getIntervals = (start, end, number) => {
  const interval = end - start;
  const step = Math.round(interval / number);
  const intervals = {};

  let intStart = start;
  let intEnd = start + step;
  while (intEnd <= end) {
    intervals[`${intStart}-${intEnd}`] = {
      start: intStart,
      end: intEnd
    };

    intStart = intStart + step;
    intEnd = intEnd + step;
  }

  console.log("intervals::", intervals);
  
  return intervals;
}

export const getCallCountData = ({ apps, startTime, endTime }) => {
  let obj = {};

  const intervals = getIntervals(startTime, endTime, 10);
  console.log('CallCount intervals', intervals);
  console.log('CallCount apps', apps);

  for (const i in intervals) {
    let { start, end } = intervals[i];
    start = moment(start);
    end = moment(end);

    console.log('CallCount - inside for loop - start', start);

    for (const appId in apps) {
      const app = apps[appId];
      const count = (app.call_count || []).reduce((acc, { count }) => {
        return acc + count;
      }, 0);

      console.log('CallCount count', count);

      const appTime = moment(app.time);
      console.log('CallCount - appTime', appTime);
      if (appTime.isSameOrAfter(start) && appTime.isSameOrBefore(end)) {
        if (obj[i]) {
          obj[i].value = obj[i].value + count;
        } else {
          obj[i] = {
            group: 'Dataset1',
            key: app.time,
            value: count
          }
        }
      }
    }
  }
  console.log('CallCount - Object', Object.values(obj));
  return Object.values(obj);
}

export const getLatencyData = ({ apps, startTime, endTime }) => {
  let obj = {};

  console.log('latency starttime', startTime);

  const intervals = getIntervals(startTime, endTime, 10);

  for (const i in intervals) {
    let { start, end } = intervals[i];
    start = moment(start);
    end = moment(end);

    for (const appId in apps) {
      const app = apps[appId];
      let latency = (app.latency || []).reduce((acc, { latency }) => {
        return acc + latency;
      }, 0);
      latency = latency > 0 ? latency / (app.latency || []).length : 0;

      const appTime = moment(app.time);
      if (appTime.isSameOrAfter(start) && appTime.isSameOrBefore(end)) {
        if (obj[i]) {
          obj[i].value = obj[i].value + latency;
          obj[i].count = obj[i].count + 1;
        } else {
          obj[i] = {
            group: 'Dataset1',
            key: app.time,
            value: latency,
            count: 1
          }
        }
      }
    }
  }

  return Object.values(obj).map(({ count, value, ...rest }) => {
    return {
      ...rest,
      value: Number((value / count).toFixed(2))
    }
  });
}

//Error data starts here
export const getErrorRateData = ({ apps, startTime, endTime }) => {
  let obj = {};

  const intervals = getIntervals(startTime, endTime, 10);

  for (const i in intervals) {
    let { start, end } = intervals[i];
    start = moment(start);
    end = moment(end);

    for (const appId in apps) {
      const app = apps[appId];
      let errorrate = (app.latency || []).reduce((acc, { latency }) => {
        return acc + latency;
      }, 0);
      errorrate = errorrate > 0 ? errorrate / (app.latency || []).length : 0;

      const appTime = moment(app.time);
      if (appTime.isSameOrAfter(start) && appTime.isSameOrBefore(end)) {
        if (obj[i]) {
          obj[i].value = obj[i].value + errorrate;
          obj[i].count = obj[i].count + 1;
        } else {
          obj[i] = {
            group: 'Dataset1',
            key: app.time,
            value: errorrate,
            count: 1
          }
        }
      }
    }
  }

  return Object.values(obj).map(({ count, value, ...rest }) => {
    return {
      ...rest,
      value: Number((value / count).toFixed(2))
    }
  });
}
//Error data ends here


//Aggregation data starts here
export const getAnalyticAggregationData = ({ apps, startTime, endTime }) => {
  let obj = {};

  const intervals = getIntervals(startTime, endTime, 2);

  for (const i in intervals) {
    let { start, end } = intervals[i];
    start = moment(start);
    end = moment(end);

    for (const appId in apps) {
      const app = apps[appId];
      let errorrate = (app.latency || []).reduce((acc, { latency }) => {
        return acc + latency;
      }, 0);
      errorrate = errorrate > 0 ? errorrate / (app.latency || []).length : 0;

      const appTime = moment(app.time);
      if (appTime.isSameOrAfter(start) && appTime.isSameOrBefore(end)) {
        if (obj[i]) {
          obj[i].value = obj[i].value + errorrate + 2;
          obj[i].count = obj[i].count + 1;
        } else {
          obj[i] = {
            group: 'User1',
            key: app.time,
            value: errorrate,
            count: 1
          }
        }
      }
    }
  }

  return Object.values(obj).map(({ count, value, ...rest }) => {
    return {
      ...rest,
      value: Number((value / count).toFixed(2))
    }
  });
}
//Aggregation data ends here


//Abandonmet data starts here
export const getAbandonmentRateData = ({ apps, startTime, endTime }) => {
  let obj = {};

  const intervals = getIntervals(startTime, endTime, 10);

  for (const i in intervals) {
    let { start, end } = intervals[i];
    start = moment(start);
    end = moment(end);

    for (const appId in apps) {
      const app = apps[appId];
      let errorrate = (app.latency || []).reduce((acc, { latency }) => {
        return acc + latency;
      }, 0);
      errorrate = errorrate > 0 ? errorrate / (app.latency || []).length : 0;

      const appTime = moment(app.time);
      if (appTime.isSameOrAfter(start) && appTime.isSameOrBefore(end)) {
        if (obj[i]) {
          obj[i].value = obj[i].value + errorrate;
          obj[i].count = obj[i].count + 1;
        } else {
          obj[i] = {
            group: 'Dataset1',
            key: app.time,
            value: errorrate,
            count: 1
          }
        }
      }
    }
  }

  return Object.values(obj).map(({ count, value, ...rest }) => {
    return {
      ...rest,
      value: Number((value / count).toFixed(2))
    }
  });
}
//Abandonment data ends here

export const getTokenCountData = ({ apps, startTime, endTime }) => {
  let obj = {};

  const intervals = getIntervals(startTime, endTime, 10);

  for (const i in intervals) {
    let { start, end } = intervals[i];
    start = moment(start);
    end = moment(end);

    for (const appId in apps) {
      const app = apps[appId];
      const count = (app.token_count || []).reduce((acc, { count }) => {
        return acc + count;
      }, 0);

      const appTime = moment(app.time);
      if (appTime.isSameOrAfter(start) && appTime.isSameOrBefore(end)) {
        if (obj[i]) {
          obj[i].value = obj[i].value + count;
        } else {
          obj[i] = {
            group: 'Dataset1',
            key: app.time,
            value: count
          }
        }
      }
    }
  }

  return Object.values(obj);
}
