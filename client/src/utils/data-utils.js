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

export function formatCount(count) {
    if (count > 10000000) {
      return `${(count / 100000000).toFixed(1)} B`;
    }
    if (count > 100000) {
      return `${(count / 1000000).toFixed(1)} M`;
    }
    if (count > 1000) {
      return `${(count / 1000).toFixed(1)} K`;
    } else {
      return count
    }
  }
  