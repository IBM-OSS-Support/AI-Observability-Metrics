import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import moment from "moment";

// Components ----------------------------------------------------------------->
import { Tile } from "@carbon/react";
import { GaugeChart } from "@carbon/charts-react";
import { useStoreContext } from "../../../store";
import { Tooltip, Button } from '@carbon/react';
import { InformationFilled } from "@carbon/icons-react";

const options = {
  theme: "g90",
  title: '',
  resizable: true,
  height: '60%',
  width: '100%',
  gauge: {
    alignment: 'center',
    type: 'semi',
    status: 'danger',
    arcWidth: 25,
  },
  color: {
    scale: {
      value: '#136e6d'
    }
  }
}

const defaultData = [
  {
    group: 'value',
    value: 0
  }
];

const defaultMessage = [
  {
    percentage_usage: 0
  }
];



const AdoptionRate = forwardRef((props, ref) => {
  const [data, setData] = useState(defaultData);
  const [avg, setAvg] = useState(0);
  const [messageFromServerAdoption, setMessageFromServerAdoption] = useState(defaultMessage);

  const { state } = useStoreContext();

  useImperativeHandle(ref, () => ({
    sendMessageToServerAdoption,
  }));

  // Function to send query to the API and get the response
  const sendMessageToServerAdoption = async (selectedItem, selectedUser) => {
    let q = ` WITH user_counts AS (
              SELECT app_user, COUNT(*) AS user_count
              FROM auditing
              GROUP BY app_user
            ),
            total_count AS (
              SELECT COUNT(*) AS total
              FROM auditing
            )
            SELECT uc.app_user, uc.user_count, (uc.user_count * 100.0 / tc.total) AS percentage_usage
            FROM user_counts uc, total_count tc
            ORDER BY percentage_usage DESC;`;

    if (selectedItem) {
      q = `WITH user_counts AS (
            SELECT app_user, COUNT(*) AS user_count
            FROM auditing WHERE application_name = '${selectedItem}'
            GROUP BY app_user
          ),
          total_count AS (
            SELECT COUNT(*) AS total
            FROM auditing
          )
          SELECT uc.app_user, uc.user_count, (uc.user_count * 100.0 / tc.total) AS percentage_usage
          FROM user_counts uc, total_count tc
          ORDER BY percentage_usage DESC;`;
    }

    if (selectedUser) {
      q = `WITH user_counts AS (
            SELECT app_user, COUNT(*) AS user_count
            FROM auditing WHERE app_user = '${selectedUser}'
            GROUP BY app_user
          ),
          total_count AS (
            SELECT COUNT(*) AS total
            FROM auditing
          )
          SELECT uc.app_user, uc.user_count, (uc.user_count * 100.0 / tc.total) AS percentage_usage
          FROM user_counts uc, total_count tc
          ORDER BY percentage_usage DESC;`;
    }

    if (selectedUser && selectedItem) {
      q = `WITH user_counts AS (
            SELECT app_user, COUNT(*) AS user_count
            FROM auditing WHERE app_user = '${selectedUser}' AND application_name = '${selectedItem}'
            GROUP BY app_user
          ),
          total_count AS (
            SELECT COUNT(*) AS total
            FROM auditing
          )
          SELECT uc.app_user, uc.user_count, (uc.user_count * 100.0 / tc.total) AS percentage_usage
          FROM user_counts uc, total_count tc
          ORDER BY percentage_usage DESC;`;
    }

    try {
      const apiUrl = process.env.REACT_APP_BACKEND_API_URL; // Use API URL instead of WebSocket URL
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: q }),
      });

      const result = await response.json();
      setMessageFromServerAdoption(result);
    } catch (error) {
      console.error('Error fetching data from API:', error);
    }
  };

  useEffect(() => {
    if (messageFromServerAdoption.length > 0) {
      const newAvgValue = parseFloat(messageFromServerAdoption[0].percentage_usage) || 0;
      setAvg(newAvgValue.toFixed(2));
      setData([
        {
          group: 'value',
          value: newAvgValue
        }
      ]);
    }
  }, [messageFromServerAdoption]);

  console.log('Adoption messageFromServerAdoption', messageFromServerAdoption);

  // Render
  return (
    <Tile className="infrastructure-components cpu-usage">
      <h5>Adoption Rate
      <Button
          hasIconOnly
          renderIcon={InformationFilled}
          iconDescription="The adoption rate measures how often each user is interacting with or using the system"
          kind="ghost"
          size="sm"
          className="customButton"
        />
      </h5>
      <div className="cpu-usage-chart">
        <GaugeChart
          data={data}
          options={options}
        />
      </div>
    </Tile>
  );
});

export default AdoptionRate;
