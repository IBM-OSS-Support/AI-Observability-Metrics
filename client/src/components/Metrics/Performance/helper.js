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

export const getCallCountData = (metricsData) => {
  let arr = [];

  for (const appId in metricsData) {
    const app = metricsData[appId];
    const count = app.call_count.reduce((acc, { count }) => {
      return acc + count;
    }, 0)

    arr.push({
      group: 'Dataset1',
      key: app.time,
      value: count
    })
  }

  return arr;
}
