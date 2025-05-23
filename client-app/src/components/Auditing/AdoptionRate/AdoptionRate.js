import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";

// Components ----------------------------------------------------------------->
import { CodeSnippetSkeleton, Tile, Button } from "@carbon/react";
import { GaugeChart } from "@carbon/charts-react";
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
    arcWidth: 25,
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


const AdoptionRate = forwardRef(({selectedUser, selectedItem}, ref) => {
  const [data, setData] = useState([]);
  const [avg, setAvg] = useState(0);
  const [messageFromServerAdoption, setMessageFromServerAdoption] = useState([]);
  const [totalNumber, setTotalNumber] = useState(0);

  
  const [loading, setLoading] = useState(true); // Add loading state

  useImperativeHandle(ref, () => ({
    sendMessageToServerAdoption,
  }));

  // Function to send query to the API and get the response

  const buildAdoptionQuery = (selectedItem, selectedUser) => {
    let baseQuery = `WITH user_counts AS (
                       SELECT app_user, COUNT(*) AS user_count
                       FROM auditing`;
  
    const conditions = [];
    if (selectedItem) conditions.push(`application_name = '${selectedItem}'`);
    if (selectedUser) conditions.push(`app_user = '${selectedUser}'`);
  
    if (conditions.length) baseQuery += ` WHERE ${conditions.join(" AND ")}`;
    
    baseQuery += ` GROUP BY app_user),
                   total_count AS (
                     SELECT COUNT(*) AS total FROM auditing
                   )
                   SELECT uc.app_user, uc.user_count, (uc.user_count * 100.0 / tc.total) AS percentage_usage
                   FROM user_counts uc, total_count tc
                   ORDER BY percentage_usage DESC;`;
  
    return baseQuery;
  };
  
  const sendMessageToServerAdoption = async (selectedItem, selectedUser) => {
    setLoading(true);
    const query = buildAdoptionQuery(selectedItem, selectedUser);
  
    try {
      const apiUrl = process.env.REACT_APP_BACKEND_API_URL;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
  
      if (!response.ok) throw new Error("Network response was not ok");
  
      const responseData = await response.json();
      setMessageFromServerAdoption(responseData);
    } catch (error) {
      console.error("Error fetching data from API:", error);
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    if (messageFromServerAdoption.length > 0) {
      const newAvgValue = parseFloat(messageFromServerAdoption[0].percentage_usage) || 0;
      setAvg(newAvgValue.toFixed(2));
      const number = messageFromServerAdoption.length;
      setTotalNumber(number)
      setData([
        {
          group: 'value',
          value: newAvgValue
        }
      ]);
    }
  }, [messageFromServerAdoption]);

  // Render
  return (
    <>
    {
      loading ? (
        <Tile className="infrastructure-components cpu-usage p-0">
      <h4 className="title">
        Adoption Rate
        <Button
          hasIconOnly
          renderIcon={InformationFilled}
          iconDescription="The adoption rate measures how often each user is interacting with or using the system"
          kind="ghost"
          size="sm"
          className="customButton"
        />
      </h4>
      <CodeSnippetSkeleton type="multi" />
      <CodeSnippetSkeleton type="multi" />
    </Tile>
      ) : (
        <Tile className="infrastructure-components cpu-usage p-0">
        <h4 className="title">
          Adoption Rate
          <Button
            hasIconOnly
            renderIcon={InformationFilled}
            iconDescription="The adoption rate measures how often each user is interacting with or using the system"
            kind="ghost"
            size="sm"
            className="customButton"
          />
        </h4>
        {
          data.length > 0 ? (
            <>
            <p>
          <ul className="sub-title">
            <li><strong>User Name:</strong> { `${selectedUser || 'For All User Name'}`}</li>
            <li><strong>Application Name:</strong> { `${selectedItem || 'For All Application Name'}`}</li>
          </ul>
        </p>
        <div className="cpu-usage-chart">
          <GaugeChart
            data={data}
            options={options}
          />
        </div>
        <div className="cpu-usage-data">
          <div className="label">Number of Adoption Rate Occured</div>
          <h3 className="data">{totalNumber}</h3>
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

export default AdoptionRate;
