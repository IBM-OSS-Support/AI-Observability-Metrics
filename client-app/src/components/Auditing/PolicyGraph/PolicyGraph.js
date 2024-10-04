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
import React, { useMemo } from "react";
import { Column, Tile } from "@carbon/react";
import { DonutChart } from "@carbon/charts-react";

const defaultOptions = {
  theme: 'g90',
  title: 'policy.name',
  resizable: true,
  toolbar: {
    enabled: false,
  },
  donut: {
    center: {
      label: 'Applications'
    },
    alignment: 'center'
  },
  pie: {
    labels: {
      formatter: ((data) => data.value)
    }
  },
  height: '320px'
}

const PolicyGraph = ({ policy, apps }) => {

  const {data, options} = useMemo(() => {
    const policies = [...policy.policy].sort((a, b) => b.value - a.value);
    const options = {
      ...defaultOptions,
      title: policy.name,
      color: {
        scale: policies.reduce((sc, p) => ({...sc, [p.name]: p.color}), {})
      },
      legend: {
        order: policies.map((p) => p.name)
      },
    }
    const counts = apps.reduce((d, app) => {
      const name = policies.find(p => app[policy.policyOn] >= p.value)?.name || '';
      return {
        ...d,
        [name]: (d[name] || 0) + 1
      }
    }, policy.policy.reduce((k, p) => ({...k, [p.name]: 0}), {}));

    const data = Object.keys(counts).map(key => ({
      group: key,
      value: counts[key]
    }));
    return {options, data}
  }, [policy, apps]);

  return (
    <Column max={4} xlg={4} lg={4} md={2} sm={2} span={4} >
      <Tile title={policy.name} className="policy-tile">
        <DonutChart
          data={data}
          options={options}>
        </DonutChart>
      </Tile>
    </Column>
  );
}

export default PolicyGraph;