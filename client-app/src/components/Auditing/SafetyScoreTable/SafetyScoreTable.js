import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import CustomDataTable from "../../common/CustomDataTable";
import { DonutChart, MeterChart, PieChart } from "@carbon/charts-react";
import { Tile } from "@carbon/react";

const options = {
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
  color: {
    gradient: {
        colors: '[blue',
        enabled: true,
    },
},
  height: "400px",
};



const SafetyScoreTable = forwardRef(
  ({ selectedItem, selectedUser, startDate, endDate }, ref) => {
    const [graphData, setGraphData] = useState([]);
    const [data, setData] = useState([]);

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
      if (startDate && endDate) {
        if (selectedItem && !selectedUser) {
          q = `
        SELECT COUNT(*) AS total_records,
               SUM(CASE WHEN flagged THEN 1 ELSE 0 END) AS true_count,
               SUM(CASE WHEN NOT flagged THEN 1 ELSE 0 END) AS false_count,
               (SUM(CASE WHEN flagged THEN 1 ELSE 0 END)::NUMERIC / COUNT(*)) * 100 AS true_percentage,
               (SUM(CASE WHEN NOT flagged THEN 1 ELSE 0 END)::NUMERIC / COUNT(*)) * 100 AS false_percentage
        FROM auditing
        WHERE application_name = '${selectedItem}' AND timestamp >= '${startDate}' AND timestamp <= '${endDate}'`;
        }
        if (selectedUser && !selectedItem) {
          q = `
        SELECT COUNT(*) AS total_records,
               SUM(CASE WHEN flagged THEN 1 ELSE 0 END) AS true_count,
               SUM(CASE WHEN NOT flagged THEN 1 ELSE 0 END) AS false_count,
               (SUM(CASE WHEN flagged THEN 1 ELSE 0 END)::NUMERIC / COUNT(*)) * 100 AS true_percentage,
               (SUM(CASE WHEN NOT flagged THEN 1 ELSE 0 END)::NUMERIC / COUNT(*)) * 100 AS false_percentage
        FROM auditing
        WHERE app_user = '${selectedUser}' AND timestamp >= '${startDate}' AND timestamp <= '${endDate}'`;
        }
        if (selectedUser && selectedItem) {
          q = `
        SELECT COUNT(*) AS total_records,
               SUM(CASE WHEN flagged THEN 1 ELSE 0 END) AS true_count,
               SUM(CASE WHEN NOT flagged THEN 1 ELSE 0 END) AS false_count,
               (SUM(CASE WHEN flagged THEN 1 ELSE 0 END)::NUMERIC / COUNT(*)) * 100 AS true_percentage,
               (SUM(CASE WHEN NOT flagged THEN 1 ELSE 0 END)::NUMERIC / COUNT(*)) * 100 AS false_percentage
        FROM auditing
        WHERE application_name = '${selectedItem}' AND app_user = '${selectedUser}' AND timestamp >= '${startDate}' AND timestamp <= '${endDate}'`;
        }
      } else if (selectedItem && !selectedUser) {
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

        const data = await response.json();
        console.log("data in datatable", data);

        const truePercentage = parseFloat(data[0].true_count);
        const falsePercentage = parseFloat(data[0].false_count);

        console.log("Percentages", truePercentage, falsePercentage);


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
        if (data) {
          setData(data[0].total_records);
        }
        setGraphData(formattedData); // Assuming the data format matches the table rows
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    console.log("Graph data", graphData);

    return (
      <Tile className="infrastructure-components cpu-usage">
        <h5>Safety Score</h5>
        <div className="cpu-usage-chart">
          <PieChart data={graphData} options={options} />
        </div>
          <h5>Total Count = {data}</h5>
      </Tile>
    );
  }
);

export default SafetyScoreTable;
