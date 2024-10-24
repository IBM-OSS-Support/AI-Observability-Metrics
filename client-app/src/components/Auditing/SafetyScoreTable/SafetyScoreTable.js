import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import CustomDataTable from "../../common/CustomDataTable";
import { DonutChart, MeterChart, PieChart } from "@carbon/charts-react";
import { Button, CodeSnippetSkeleton, Tile } from "@carbon/react";
import { InformationFilled } from "@carbon/icons-react";
import NoData from "../../common/NoData/NoData";

const options = {
  theme: "g90",
  title: "",
  resizable: true,
  legend: {
    alignment: "center",
  },
  pie: {
    valueMapsTo: 'count',
    alignment: 'center',
    loading : true
  },
  legend: {
    enabled: true
  },
  toolbar: {
    enabled: false
  },
  color: {
    gradient: {
        colors: '[blue',
        enabled: true,
    },
  },
  height: "285px",
};



const SafetyScoreTable = forwardRef( ({ selectedItem, selectedUser, startDate, endDate }, ref) => {
    const [graphData, setGraphData] = useState([]);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true); // Add loading state

    useImperativeHandle(ref, () => ({
      sendMessageToServer,
    }));

    const sendMessageToServer = async (
      selectedItem,
      selectedUser,
      startDate,
      endDate
    ) => {
      let q = `
      SELECT COUNT(*) AS total_records,
             SUM(CASE WHEN flagged THEN 1 ELSE 0 END) AS true_count,
             SUM(CASE WHEN NOT flagged THEN 1 ELSE 0 END) AS false_count,
             (SUM(CASE WHEN flagged THEN 1 ELSE 0 END)::NUMERIC / COUNT(*)) * 100 AS true_percentage,
             (SUM(CASE WHEN NOT flagged THEN 1 ELSE 0 END)::NUMERIC / COUNT(*)) * 100 AS false_percentage
      FROM auditing`;

      // Add filtering logic based on selectedItem, selectedUser, startDate, and endDate
      if (selectedItem && !selectedUser) {
        q = `
      SELECT COUNT(*) AS total_records,
             SUM(CASE WHEN flagged THEN 1 ELSE 0 END) AS true_count,
             SUM(CASE WHEN NOT flagged THEN 1 ELSE 0 END) AS false_count,
             (SUM(CASE WHEN flagged THEN 1 ELSE 0 END)::NUMERIC / COUNT(*)) * 100 AS true_percentage,
             (SUM(CASE WHEN NOT flagged THEN 1 ELSE 0 END)::NUMERIC / COUNT(*)) * 100 AS false_percentage
      FROM auditing
      WHERE application_name = '${selectedItem}'`;
      } else if (selectedUser && !selectedItem) {
        q = `
      SELECT COUNT(*) AS total_records,
             SUM(CASE WHEN flagged THEN 1 ELSE 0 END) AS true_count,
             SUM(CASE WHEN NOT flagged THEN 1 ELSE 0 END) AS false_count,
             (SUM(CASE WHEN flagged THEN 1 ELSE 0 END)::NUMERIC / COUNT(*)) * 100 AS true_percentage,
             (SUM(CASE WHEN NOT flagged THEN 1 ELSE 0 END)::NUMERIC / COUNT(*)) * 100 AS false_percentage
      FROM auditing
      WHERE app_user = '${selectedUser}'`;
      } else if (selectedUser && selectedItem) {
        q = `
      SELECT COUNT(*) AS total_records,
             SUM(CASE WHEN flagged THEN 1 ELSE 0 END) AS true_count,
             SUM(CASE WHEN NOT flagged THEN 1 ELSE 0 END) AS false_count,
             (SUM(CASE WHEN flagged THEN 1 ELSE 0 END)::NUMERIC / COUNT(*)) * 100 AS true_percentage,
             (SUM(CASE WHEN NOT flagged THEN 1 ELSE 0 END)::NUMERIC / COUNT(*)) * 100 AS false_percentage
      FROM auditing
      WHERE application_name = '${selectedItem}' AND app_user = '${selectedUser}'`;
      }

      try {
        const apiUrl = process.env.REACT_APP_BACKEND_API_URL; // API URL
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: q }), // Sending query as body
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        var responseData = await response.json();

        const truePercentage = parseFloat(responseData[0].true_count);
        const falsePercentage = parseFloat(responseData[0].false_count);



        const formattedData = [
          {
            group: "True Count",
            count: parseFloat(truePercentage),
          },
          {
            group: "False Count",
            count: parseFloat(falsePercentage),
          },
        ];
        if (responseData) {
          setData(responseData[0].total_records);
        }
        setGraphData(formattedData); // Assuming the data format matches the table rows
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

    return (
      <>
      {
        loading ? (
          <Tile className="infrastructure-components cpu-usage p-0">
          <h4 className="title">
            Safety Score
            <Button
              hasIconOnly
              renderIcon={InformationFilled}
              iconDescription="The safety score indicates where or not the prompt provided by the user was harmful or not."
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
            Safety Score
            <Button
              hasIconOnly
              renderIcon={InformationFilled}
              iconDescription="The safety score indicates where or not the prompt provided by the user was harmful or not."
              kind="ghost"
              size="sm"
              className="customButton"
            />
          </h4>
          {
            graphData.length > 0 ? (
              <>
              <p>
              <ul className="sub-title">
                <li><strong>User Name:</strong> { `${selectedUser || 'For All User Name'}`}</li>
                <li><strong>Application Name:</strong> { `${selectedItem || 'For All Application Name'}`}</li>
              </ul>
            </p>
          <div className="cpu-usage-chart">
            <PieChart data={graphData} options={options} />
          </div>
          <div className="cpu-usage-data mt-2">
            <div className="label">Total Number of Rows Counted</div>
            <h3 className="data">{data}</h3>
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
  }
);

export default SafetyScoreTable;
