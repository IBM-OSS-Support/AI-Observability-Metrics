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

export const defaultHeaders = [
  {
    key: "cveId",
    header: "CVE id",
    checked: true,
  },
  {
    key: "severity",
    header: "severity",
    checked: true,
  },
  {
    key: "status",
    header: "Status",
    checked: true,
  },
  {
    key: "submittedDate",
    header: "Submitted date",
    checked: true,
  },
  {
    key: "assignedTo",
    header: "Assigned to",
    checked: true,
  },
  {
    key: "proposedAction",
    header: "Proposed action",
    checked: true,
  }
];

export const statusMap = {
  'CVE Submitted': 'cve_submitted',
  'Assessment': 'assessment',
  'Mitigate': 'mitigate',
  'Upgrade': 'upgrade',
  'Patch': 'patch',
  'False Positive': 'false_positive',
  'Review / Acceptance': 'review',
  'Approve change': 'approve_change',
  'Publish & URL': 'publish',
  'Trigger change': 'trigger_change',
  'Confirm remediation': 'confirm_remediation',
  'Close': 'close'
}

export const CVE_DUMMY_DATA = [
  {
    cveId: 'CVE-2024-0023',
    severity: 'Medium',
    status: 'Mitigate',
    submittedDate: '2024-01-19 13:20:24',
    assignedTo: 'Srini',
    proposedAction: 'Re-scan'
  },
  {
    cveId: 'CVE-2023-6378',
    severity: 'High',
    status: 'False Positive',
    submittedDate: '2023-12-11 01:11:00',
    assignedTo: 'James',
    proposedAction: 'Review'
  },
  {
    cveId: 'CVE-2023-6321',
    severity: 'Critical',
    status: 'Confirm remediation',
    submittedDate: '2023-11-21 22:17:02',
    assignedTo: 'Srini',
    proposedAction: ''
  }
]