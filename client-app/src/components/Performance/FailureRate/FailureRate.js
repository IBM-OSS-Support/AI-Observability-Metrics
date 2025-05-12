import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { Button, CodeSnippetSkeleton, Tile } from "@carbon/react";
import { GaugeChart } from "@carbon/charts-react";
import { getAppData } from "../../../appData";
import { useStoreContext } from "../../../store";
import { InformationFilled } from "@carbon/icons-react";
import NoData from "../../common/NoData/NoData";

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



const FailureRate = forwardRef(({ selectedUser, selectedItem }, ref) => {
  const [data, setData] = useState([]);
  const [avg, setAvg] = useState(0);
  const [failureNumber, setFailureNumber] = useState(0);
  const [messageFromServerFailure, setMessageFromServerFailure] = useState([]);
  const [loading, setLoading] = useState(true);

  const { state } = useStoreContext();

  useImperativeHandle(ref, () => ({
    sendMessageToServerFailure,
  }));

  const buildQuery = (user, app) => {
    if (user && app) {
      return `SELECT COUNT(*) FILTER (WHERE app_user = '${user}' AND application_name = '${app}') AS total_count, COUNT(*) FILTER (WHERE status = 'failure' AND app_user = '${user}' AND application_name = '${app}') * 100.0 / COUNT(*) AS failure_percentage FROM log_history`;
    }
    if (user) {
      return `SELECT COUNT(*) FILTER (WHERE app_user = '${user}') AS total_count, COUNT(*) FILTER (WHERE status = 'failure' AND app_user = '${user}') * 100.0 / COUNT(*) AS failure_percentage FROM log_history`;
    }
    if (app) {
      return `SELECT COUNT(*) FILTER (WHERE application_name = '${app}') AS total_count, COUNT(*) FILTER (WHERE status = 'failure') * 100.0 / COUNT(*) AS failure_percentage FROM log_history`;
    }
    return `SELECT COUNT(*) AS total_count, COUNT(*) FILTER (WHERE status = 'failure') * 100.0 / COUNT(*) AS failure_percentage FROM log_history`;
  };

  const processResponseData = (data) => {
    if (!Array.isArray(data) || data.length === 0) {
      return;
    }

    const { failure_percentage, total_count } = data[0];
    const percentage = parseFloat(failure_percentage || 0);
    const avgFixed = percentage.toFixed(2);
    const failedJobs = Math.ceil((percentage * total_count) / 100);

    setFailureNumber(failedJobs);
    setAvg(avgFixed);
    setData([{ group: 'value', value: percentage }]);
  };

  const sendMessageToServerFailure = async (app, user) => {
    const query = buildQuery(user, app);
    const apiUrl = process.env.REACT_APP_BACKEND_API_URL;

    setLoading(true);
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) throw new Error('Failed to fetch data');

      const responseData = await response.json();
      setMessageFromServerFailure(responseData);
      processResponseData(responseData);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (state.status === 'success' && messageFromServerFailure.length > 0) {
      processResponseData(messageFromServerFailure);
    }
  }, [messageFromServerFailure, state]);

  const renderLoading = () => (
    <Tile className="infrastructure-components cpu-usage">
      <h4 className="title">
        Failure Rate
        <Button
          hasIconOnly
          renderIcon={InformationFilled}
          iconDescription="Failure rate can be defined as the anticipated number of times that an item fails in a specified period of time."
          kind="ghost"
          size="sm"
          className="customButton"
        />
      </h4>
      <CodeSnippetSkeleton type="multi" />
      <CodeSnippetSkeleton type="multi" />
    </Tile>
  );

  const renderContent = () => (
    <Tile className="infrastructure-components cpu-usage">
      <h4 className="title">
        Failure Rate
        <Button
          hasIconOnly
          renderIcon={InformationFilled}
          iconDescription="Failure rate can be defined as the anticipated number of times that an item fails in a specified period of time."
          kind="ghost"
          size="sm"
          className="customButton"
        />
      </h4>
      {data.length > 0 ? (
        <>
          <ul className="sub-title">
            <li><strong>User Name:</strong> {selectedUser || 'For All User Name'}</li>
            <li><strong>Application Name:</strong> {selectedItem || 'For All Application Name'}</li>
          </ul>
          <div className="cpu-usage-chart">
            <GaugeChart data={data} options={options} />
          </div>
          <div className="cpu-usage-data">
            <div className="label">Number of jobs failed</div>
            <h3 className="data">{failureNumber}</h3>
          </div>
        </>
      ) : (
        <NoData />
      )}
    </Tile>
  );

  return loading ? renderLoading() : renderContent();
});

export default FailureRate;
