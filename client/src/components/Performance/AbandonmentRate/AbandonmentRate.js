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

import { StackedBarChart } from "@carbon/charts-react";
import { Maximize } from "@carbon/icons-react";

import { useStoreContext } from "../../../store";
import { getAppData } from "../../../appData";
import { AbandonmentRateData } from "../constants";

const options = {
  theme: "g100",
  title: "Abandonment Rate",
  axes: {
    left: {
      mapsTo: "value",
      stacked: true
    },
    bottom: {
      mapsTo: "key",
      scaleType: "labels",
    }
  },
  legend: {
    position: 'top'
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
  tooltip: {
    truncation: {
      numCharacter: 20
    },
    groupLabel: 'count of',
  },
  height: "100%",
  color: {
    scale: {
      Dataset1: "#5281d8"
    },
  },
};

function AbandonmentRate() {
  const { state } = useStoreContext();

  const callCountData = useMemo(() => {
    if (state.metrics) {
      const appData = getAppData();

      return appData
        .map(d => (d.data.spans || []).reduce((_counts, { data_profile }) => {
          if (data_profile && !!data_profile.length) {
            data_profile.forEach(({data_name, counts}) => {

              if (d.data['application-name'] == "abdulla-app-demo") {

                console.log("T.",d.data['application-name']);
                switch (data_name) {
                  case 'messages':
                    _counts.success += +counts.find(count => count.name === 'token_count')?.count - 30 || 0;
                    break;
                  case 'completion':
                    _counts.failure += +counts.find(count => count.name === 'token_count')?.count + 10 || 0;
                  case 'completion':
                    _counts.userabandoned += +counts.find(count => count.name === 'token_count')?.count - 20 || 0;
                    break;
                  default: ;
                }
              } 
              if (d.data['application-name'] == "bhoomaiah-application-demo") {

                console.log("F.",d.data['application-name']);
                switch (data_name) {
                  case 'messages':
                    _counts.success += +counts.find(count => count.name === 'token_count')?.count - 200 || 0;
                    break;
                  case 'completion':
                    _counts.failure += +counts.find(count => count.name === 'token_count')?.count + 50 || 0;
                  case 'completion':
                    _counts.userabandoned += +counts.find(count => count.name === 'token_count')?.count || 0;
                    break;
                  default: ;
                }
              }
  
              switch (data_name) {
                case 'messages':
                  _counts.success += +counts.find(count => count.name === 'token_count')?.count || 0;
                  break;
                case 'completion':
                  _counts.failure += +counts.find(count => count.name === 'token_count')?.count || 0;
                case 'completion':
                  _counts.userabandoned += +counts.find(count => count.name === 'token_count')?.count || 0;
                  break;
                default: ;
              }
            }, _counts);
          }
          return _counts;
          }, {success: 0, failure: 0,userabandoned: 0, appName: d.data['application-name']})
        )
        .map(count => [
          {
            group: 'Success',
            key: count.appName,
            value: count.success
          },
          {
            group: 'Failure',
            key: count.appName,
            value: count.failure
          },
          {
            group: 'User Abandoned',
            key: count.appName,
            value: count.userabandoned
          }
        ])
        .flat();
    }

    return [];
  }, [state.metrics]);

  return (
    <>
      <StackedBarChart
        data={callCountData}
        options={options}
      />
    </>
  );
}

export default AbandonmentRate;
