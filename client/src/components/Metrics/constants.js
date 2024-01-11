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

export const callCountData = [
  {
    group: 'Dataset1',
    key: 'Qty',
    value: 34200
  },
  {
    group: 'Dataset1',
    key: 'Misc',
    value: 12300
  }
];

export const callCountOptions = {
  title: 'Call count'
}

export const latencyData = [
  {
    group: 'Dataset1',
    key: 'Qty',
    value: 34200
  },
  {
    group: 'Dataset1',
    key: 'Misc',
    value: 12300
  }
];

export const latencyOptions = {
  title: 'Latency'
}

export const latencyDistData = [
  {
    group: "Qty",
    value: 65000,
  },
  {
    group: "More",
    value: 29123,
  },
  {
    group: "Sold",
    value: 35213,
  },
  {
    group: "Restocking",
    value: 51213,
  },
  {
    group: "Misc",
    value: 16932,
  },
];

export const latencyDistOptions = {
  theme: "g100",
  title: "Latency distribution",
  axes: {
    left: {
      mapsTo: "value",
    },
    bottom: {
      mapsTo: "group",
      scaleType: "labels",
    },
  },
  legend: {
    enabled: false,
  },
  toolbar: {
    enabled: false,
  },
  height: "170px",
  color: {
    scale: {
      Qty: "#4589ff",
      More: "#4589ff",
      Sold: "#4589ff",
      Restocking: "#4589ff",
      Misc: "#4589ff",
    },
  },
};
