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



const SuccessRate = forwardRef(({ selectedUser, selectedItem }, ref) => {
  const [data, setData] = useState([]);
  const [avg, setAvg] = useState(0);
  const [successNumber, setSuccessNumber] = useState(0);
  const [loading, setLoading] = useState(true);
  const [messageFromServerSuccess, setMessageFromServerSuccess] = useState([]);

  const { state } = useStoreContext();

  useImperativeHandle(ref, () => ({
    sendMessageToServerSuccess,
  }));

  const buildSuccessQuery = (selectedItem, selectedUser) => {
    if (selectedUser && selectedItem) {
      return `
        SELECT 
          COUNT(*) FILTER (WHERE app_user = '${selectedUser}' AND application_name = '${selectedItem}') AS total_count,
          COUNT(*) FILTER (WHERE status = 'success' AND app_user = '${selectedUser}' AND application_name = '${selectedItem}') * 100.0 / 
          (SELECT COUNT(*) FROM log_history WHERE app_user = '${selectedUser}' AND application_name = '${selectedItem}') AS success_percentage
        FROM log_history`;
    }

    if (selectedUser) {
      return `
        SELECT 
          COUNT(*) FILTER (WHERE app_user = '${selectedUser}') AS total_count,
          COUNT(*) FILTER (WHERE status = 'success' AND app_user = '${selectedUser}') * 100.0 / 
          (SELECT COUNT(*) FROM log_history WHERE app_user = '${selectedUser}') AS success_percentage
        FROM log_history`;
    }

    if (selectedItem) {
      return `
        SELECT 
          COUNT(*) FILTER (WHERE application_name = '${selectedItem}') AS total_count,
          COUNT(*) FILTER (WHERE status = 'success' AND application_name = '${selectedItem}') * 100.0 / 
          (SELECT COUNT(*) FROM log_history WHERE application_name = '${selectedItem}') AS success_percentage
        FROM log_history`;
    }

    return `
      SELECT 
        COUNT(*) AS total_count,
        COUNT(*) FILTER (WHERE status = 'success') * 100.0 / COUNT(*) AS success_percentage 
      FROM log_history`;
  };

  const sendMessageToServerSuccess = async (selectedItem, selectedUser) => {
    setLoading(true);
    const query = buildSuccessQuery(selectedItem, selectedUser);

    try {
      const apiUrl = process.env.REACT_APP_BACKEND_API_URL;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      const responseData = await response.json();
      setMessageFromServerSuccess(responseData);
    } catch (error) {
      console.error("Error fetching success rate:", error);
    } finally {
      setLoading(false);
    }
  };

  const processSuccessData = () => {
    if (!Array.isArray(messageFromServerSuccess) || messageFromServerSuccess.length === 0) return;

    const { success_percentage, total_count } = messageFromServerSuccess[0];
    const percent = parseFloat(success_percentage || 0);
    const formattedAvg = percent.toFixed(2);
    const successJobs = Math.ceil((percent * total_count) / 100);

    setAvg(formattedAvg);
    setSuccessNumber(successJobs);
    setData([{ group: "value", value: percent }]);
  };

  useEffect(() => {
    if (state.status === "success") {
      processSuccessData();
    }
  }, [messageFromServerSuccess, state]);

  return (
    <>
      {loading ? (
        <Tile className="infrastructure-components cpu-usage">
          <h4 className="title">
            Success Rate
            <Button
              hasIconOnly
              renderIcon={InformationFilled}
              iconDescription="The success rate is measured by the number of times the application runs and completes successfully without an error."
              kind="ghost"
              size="sm"
              className="customButton"
            />
          </h4>
          <CodeSnippetSkeleton type="multi" />
          <CodeSnippetSkeleton type="multi" />
        </Tile>
      ) : (
        <Tile className="infrastructure-components cpu-usage">
          <h4 className="title">
            Success Rate
            <Button
              hasIconOnly
              renderIcon={InformationFilled}
              iconDescription="The success rate is measured by the number of times the application runs and completes successfully without an error."
              kind="ghost"
              size="sm"
              className="customButton"
            />
          </h4>
          {data.length > 0 ? (
            <>
              <ul className="sub-title">
                <li><strong>User Name:</strong> {selectedUser || "For All User Name"}</li>
                <li><strong>Application Name:</strong> {selectedItem || "For All Application Name"}</li>
              </ul>
              <div className="cpu-usage-chart">
                <GaugeChart data={data} options={options} />
              </div>
              <div className="cpu-usage-data">
                <div className="label">Number of jobs succeeded</div>
                <h3 className="data">{successNumber}</h3>
              </div>
            </>
          ) : (
            <NoData />
          )}
        </Tile>
      )}
    </>
  );
});


export default SuccessRate;
