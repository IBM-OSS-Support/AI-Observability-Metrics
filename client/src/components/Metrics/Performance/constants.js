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

import { Maximize } from '@carbon/icons-react';
import moment from 'moment';

export const callCountData = [
  {
    group: 'Dataset1',
    key: moment(1704976200).toDate(),
    value: 12
  },
  {
    group: 'Dataset1',
    key: moment(1704970800).toDate(),
    value: 48
  }
];

export const callCountOptions = {
  title: 'Call count'
}

export const latencyData = [
  {
    group: 'Dataset1',
    key: moment(1704976200).toDate(),
    value: 6.5
  },
  {
    group: 'Dataset1',
    key: moment(1704970800).toDate(),
    value: 5.4
  }
];

export const latencyOptions = {
  title: 'Latency',
  height: '19rem' //Need for homepage
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
    enabled: true,
    controls:[{
      type: "Make fullscreen"
    }],
    text: "Make fullscreen",
    iconSVG: {
      content: Maximize
    },
    shouldBeDisabled: false
  },
  height: "240px",
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

export const filterValues = {
  deployment: {
    label: 'deployment',
    options: [
      { id: 'All', label: 'All' },
      { id: 'Each', label: 'Each' },
      { id: 'my-app-prod', label: 'my-app-prod' }
    ]
  },
  component: {
    label: 'component',
    options: [
      { id: 'All', label: 'All' },
      { id: 'Each', label: 'Each' },
      { id: 'Agent', label: 'Agent' },
      { id: 'LLM', label: 'LLM' },
      { id: 'Tool', label: 'Tool' }
    ]
  },
  operation: {
    label: 'operation',
    options: [
      { id: 'All', label: 'All' },
      { id: 'Each', label: 'Each' },
      { id: 'langchain.chains.llm_math.base', label: 'langchain.chains.llm_math.base' },
      { id: 'openai.chat.completions.create', label: 'openai.chat.completions.create' },
      { id: 'langchain.chat_models.openai.ChatOpenAI', label: 'langchain.chat_models.openai.ChatOpenAI' },
      { id: 'langchain.agents.agent.AgentExecutor', label: 'langchain.agents.agent.AgentExecutor' },
      { id: 'langchain.chains.llm.LLMChain', label: 'langchain.chains.llm.LLMChain' },
      { id: 'langchain.agents.tools.Calculator', label: 'langchain.agents.tools.Calculator' }
    ]
  },
}
