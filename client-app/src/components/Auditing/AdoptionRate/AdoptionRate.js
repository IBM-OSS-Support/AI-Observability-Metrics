import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import moment from "moment";

// Components ----------------------------------------------------------------->
import { Tile } from "@carbon/react";
import { GaugeChart } from "@carbon/charts-react";
import { getAppData } from "../../../appData";
import { useStoreContext } from "../../../store";

const options = {
  theme: "g90",
  title: '',
  resizable: true,
  height: '80%',
  width: '100%',
  gauge: {
    alignment: 'center',
    type: 'semi',
    status: 'danger',
    arcWidth: 24
  },
  legend: {
    enabled: false
  },
  toolbar: {
    enabled: false
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
    percentage_usage : 0
  }
];

const AdoptionRate = forwardRef((props, ref) => {

  const websocketRef = useRef(null);
  const [data, setData] = useState(defaultData);
  const [avg, setAvg] = useState(0);
  const [messageFromServerAdoption, setMessageFromServerAdoption] = useState(defaultMessage);

  const { state } = useStoreContext();

  useImperativeHandle(ref, () => ({
    sendMessageToServerAdoption,
  }));

  // Connect to WebSocket server on component mount
  useEffect(() => {
    const apiUrl = process.env.REACT_APP_WEBSOCKET_URL;
    console.log('API URL', apiUrl);
    console.log('Process.env', process.env);
    const ws = new WebSocket(apiUrl);
    websocketRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connection established');
      sendMessageToServerAdoption();
    };

    ws.onmessage = (event) => {
      setMessageFromServerAdoption(JSON.parse(event.data));
    };

    // Cleanup function to close WebSocket connection on component unmount
    return () => {
      ws.close();
    };
  }, []);

  // Function to send message to WebSocket server
  const sendMessageToServerAdoption = (selectedItem, selectedUser) => {
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

    // let q = `SELECT * FROM auditing`

    console.log("Adop QQ:::", q);
    


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
      console.log("selectedItem", selectedItem, "Q", q);
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
      console.log("selectedUser", selectedUser, "Q", q);
    }
    if(selectedUser && selectedItem) {
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
      console.log("selectedUser", selectedUser, "Q", q);
    }
    

    const ws = websocketRef.current;
    console.log("inside adoption ws:", ws);
    if (ws && ws.readyState === WebSocket.OPEN) {
      const message = {
        tab: "auditing",
        action: q,
      };
      ws.send(JSON.stringify(message));
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

  console.log("messageFromServerAdoption", messageFromServerAdoption);
  

  // Render
  return (
    <Tile className="infrastructure-components cpu-usage" >
      <h5>Adoption Rate</h5>
      <div className="cpu-usage-chart">
        <GaugeChart
          data={data}
          options={options}
        />
      </div>
      <div className="cpu-usage-data">
        <div className="label">Adoption rate</div>
        <h3 className="data">{avg} %</h3>
      </div>
    </Tile>
  );
});

export default AdoptionRate;
