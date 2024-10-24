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



const SuccessRate = forwardRef(({selectedUser, selectedItem}, ref) => {
  const [data, setData] = useState([]);
  const [avg, setAvg] = useState(0);
  const [messageFromServerSuccess, setMessageFromServerSuccess] = useState([]);
  const [successNumber, setSuccessNumber] = useState(0);
  

  const { state } = useStoreContext();
  const [loading, setLoading] = useState(true); // Add loading state

  useImperativeHandle(ref, () => ({
    sendMessageToServerSuccess,
  }));

  // Function to fetch data from the API
  const sendMessageToServerSuccess = async (selectedItem, selectedUser) => {
    let query = `SELECT COUNT(*) AS total_count, COUNT(*) FILTER (WHERE status = 'success') * 100.0 / COUNT(*) AS success_percentage FROM log_history`;

    if (selectedItem) {
      query = `SELECT COUNT(*) FILTER (WHERE application_name = '${selectedItem}') AS total_count, COUNT(*) FILTER (WHERE status = 'success') * 100.0 / COUNT(*) AS success_percentage FROM log_history`;
    }
    if (selectedUser) {
      query = `SELECT 
          COUNT(*) FILTER (WHERE app_user = '${selectedUser}') AS total_count, 
          COUNT(*) FILTER (WHERE status = 'success' AND app_user = '${selectedUser}') * 100.0 / 
          (SELECT COUNT(*) FROM log_history WHERE app_user = '${selectedUser}') AS success_percentage
          FROM log_history`;
    }
    if (selectedUser && selectedItem) {
      query = `SELECT 
          COUNT(*) FILTER (WHERE app_user = '${selectedUser}' AND application_name = '${selectedItem}') AS total_count,
          COUNT(*) FILTER (WHERE status = 'success' AND app_user = '${selectedUser}' AND application_name = '${selectedItem}') * 100.0 / 
          (SELECT COUNT(*) FROM log_history WHERE app_user = '${selectedUser}' AND application_name = '${selectedItem}') AS success_percentage
          FROM log_history`;
    }

    try {
      const apiUrl = process.env.REACT_APP_BACKEND_API_URL;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }), // Sending query as body
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      var responseData = await response.json();
      setMessageFromServerSuccess(responseData); // Assuming the data format matches the expected structure
    } catch (error) {
      console.error("Error fetching data:", error);
    }finally {
      if (Array.isArray(responseData) && responseData.length > 0) {
        setLoading(false); // Stop loading
      }else {
        setLoading(false); // Stop loading in case of empty data or error
    }
    }
  };

  useEffect(() => {
    if (state.status === 'success') {
      const appData = getAppData(selectedUser, selectedItem);
  
      if (messageFromServerSuccess.length > 0) {
        const newAvgValue = messageFromServerSuccess[0].success_percentage; 
        const newAvgValueToNumber = parseFloat(newAvgValue);
        const newAvg = newAvgValueToNumber.toFixed(2);
        const number = Math.ceil((newAvgValueToNumber * messageFromServerSuccess[0].total_count)/100);
        setSuccessNumber(number);

        setData([
          {
            group: 'value',
            value: newAvgValueToNumber || 0
          }
        ]);
        setAvg(newAvg);
      }
    }
  }, [messageFromServerSuccess, state]);

  return (
    <>
    {
      loading ? (
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
      <p>
        <ul className="sub-title">
          <li><strong>User Name:</strong> { `${selectedUser || 'For All User Name'}`}</li>
          <li><strong>Application Name:</strong> { `${selectedItem || 'For All Application Name'}`}</li>
        </ul>
      </p>
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
      )
    }
    </Tile>
      )
    }
    </>
  );
});

export default SuccessRate;
