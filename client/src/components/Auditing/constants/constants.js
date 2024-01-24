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
import {
  cyan60,
  yellow30,
  red50,
  teal30,
  teal50,
  teal70,
  green30,
  orange30,
} from '@carbon/colors';

export const policyData = [
  {
    id: '1',
    name: 'High token consumption',
    type: 'color',
    policyOn: 'token',
    unit: '',
    policy: [
      {
        name: 'Low',
        operator: '<=',
        value: 0,
        color: cyan60
      },
      {
        name: 'Medium',
        operator: '<=',
        value: 500,
        color: yellow30
      },
      {
        name: 'High',
        operator: '>',
        value: 800,
        color: red50
      }
    ]
  },
  {
    id: '2',
    name: 'High CPU consumption',
    type: 'color',
    policyOn: 'cpu',
    unit: '%',
    policy: [
      {
        name: 'Low',
        operator: '<=',
        value: 0,
        color: cyan60
      },
      {
        name: 'Medium',
        operator: '<=',
        value: 25,
        color: yellow30
      },
      {
        name: 'High',
        operator: '>',
        value: 60,
        color: red50
      }
    ]
  },
  {
    id: '3',
    name: 'High memory consumption',
    type: 'color',
    policyOn: 'memory',
    unit: 'MB',
    policy: [
      {
        name: 'Low',
        operator: '<=',
        value: 0,
        color: green30
      },
      {
        name: 'Medium',
        operator: '<=',
        value: 300,
        color: orange30
      },
      {
        name: 'High',
        operator: '>',
        value: 500,
        color: red50
      }
    ]
  },
];

export const __apps = [
  {
    name: 'App 1',
    memory: 500,
    token: 700,
    cpu: 20
  },
  {
    name: 'App 2',
    memory: 600,
    token: 600,
    cpu: 30
  },
  {
    name: 'App 3',
    memory: 800,
    token: 500,
    cpu: 50
  },
  {
    name: 'App 4',
    memory: 500,
    token: 500,
    cpu: 50
  },
  {
    name: 'App 5',
    memory: 400,
    token: 300,
    cpu: 20
  },
  {
    name: 'App 6',
    memory: 800,
    token: 800,
    cpu: 60
  },
  {
    name: 'App 7',
    memory: 600,
    token: 600,
    cpu: 30
  },
  {
    name: 'App 8',
    memory: 200,
    token: 900,
    cpu: 10
  },
  {
    name: 'App 9',
    memory: 300,
    token: 1000,
    cpu: 20
  },
  {
    name: 'App 10',
    memory: 400,
    token: 400,
    cpu: 30
  },
  {
    name: 'App 11',
    memory: 500,
    token: 600,
    cpu: 30
  },
  {
    name: 'App 12',
    memory: 600,
    token: 650,
    cpu: 40
  },
  {
    name: 'App 13',
    memory: 700,
    token: 200,
    cpu: 50
  },
  {
    name: 'App 14',
    memory: 800,
    token: 700,
    cpu: 60
  },
  {
    name: 'App 15',
    memory: 900,
    token: 850,
    cpu: 70
  },
  {
    name: 'App 16',
    memory: 1000,
    token: 950,
    cpu: 80
  },
  {
    name: 'App 17',
    memory: 650,
    token: 550,
    cpu: 90
  },
  {
    name: 'App 18',
    memory: 450,
    token: 450,
    cpu: 65
  },
  {
    name: 'App 19',
    memory: 250,
    token: 600,
    cpu: 45
  },
  {
    name: 'App 20',
    memory: 750,
    token: 350,
    cpu: 15
  },
];