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
const KEY = 'ibm-roja-app-data'

export default class DataClient {
  static params = {
    AuditPolicy: 'audit-policies'
  }

  fetchAppData = (param) => {
    const storage = localStorage.getItem(KEY);
    const data = JSON.parse(storage) || {};
    switch (param) {
      case DataClient.params.AuditPolicy: {
        return data[param];
      }
      default: {
        return data;
      }
    }
  }
  saveAppData = (data, param) => {
    const oldData = this.fetchAppData();
    let newData = oldData;
    if (oldData) {
      switch (param) {
        case DataClient.params.AuditPolicy: {
          newData[param] = data;
          break;
        }
        default: {
          newData = data;
          break;
        }
      }
    }
    localStorage.setItem(KEY, JSON.stringify(newData));
  }
}
Object.freeze(DataClient);
Object.freeze(DataClient.params);

export const dataClient = new DataClient();