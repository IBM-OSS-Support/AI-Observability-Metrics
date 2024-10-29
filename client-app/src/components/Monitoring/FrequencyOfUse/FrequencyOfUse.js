import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import moment from "moment";
import { Button, CodeSnippetSkeleton, Tile } from "@carbon/react";
import { GaugeChart } from "@carbon/charts-react";
import { getAppData } from "../../../appData";
import { useStoreContext } from "../../../store";
import { InformationFilled } from "@carbon/icons-react";
import NoData from "../../common/NoData/NoData";

// Chart options
const options = {
  theme: "g90",
  title: "",
  resizable: true,
  height: "180px",
  width: "100%",
  gauge: {
    alignment: "center",
    type: "semi",
    status: "danger",
    arcWidth: 24,
  },
  legend: {
    enabled: false,
  },
  toolbar: {
    enabled: false,
  },
  color: {
    scale: {
      value: "#136e6d",
    },
  },
};

const defaultData = [
  {
    group: "value",
    value: 0,
  },
];

const FrequencyOfUse = forwardRef(
  ({ selectedItem, selectedUser, startDate, endDate }, ref) => {
    const [data, setData] = useState(defaultData);
    const [avg, setAvg] = useState(0);
    const [messageFromServerFrequency, setMessageFromServerFrequency] = useState([]);
    const { state } = useStoreContext();
    const [loading, setLoading] = useState(true);

    useImperativeHandle(ref, () => ({
      fetchFrequencyData,
    }));

    // Function to fetch data from the API
    const fetchFrequencyData = async () => {
      const apiUrl = process.env.REACT_APP_BACKEND_API_URL;
      let query = `
        WITH operation_counts AS (
          SELECT operation, COUNT(*) AS operation_count
          FROM operations
          GROUP BY operation
        ), total_count AS (
          SELECT COUNT(*) AS total
          FROM operations
        )
        SELECT 
          oc.operation, 
          oc.operation_count, 
          (oc.operation_count * 100.0 / tc.total) AS percentage_usage
        FROM 
          operation_counts oc, 
          total_count tc
        ORDER BY 
          percentage_usage DESC;
      `;

      // Add filtering logic based on selectedItem, selectedUser, startDate, and endDate
      if (selectedItem && !selectedUser) {
        query = `
          WITH operation_counts AS (
            SELECT operation, COUNT(*) AS operation_count
            FROM operations
            WHERE application_name = '${selectedItem}'  
            GROUP BY operation
          ),
          total_count AS (
            SELECT COUNT(*) AS total
            FROM operations
            WHERE application_name = '${selectedItem}'  
          )
          SELECT 
            oc.operation, 
            oc.operation_count, 
            (oc.operation_count * 100.0 / tc.total) AS percentage_usage
          FROM 
            operation_counts oc, 
            total_count tc
          ORDER BY 
            percentage_usage DESC;
        `;
      }
      if (selectedUser && !selectedItem) {
        query = `
          WITH operation_counts AS (
            SELECT operation, COUNT(*) AS operation_count
            FROM operations
            WHERE app_user = '${selectedUser}'  
            GROUP BY operation
          ),
          total_count AS (
            SELECT COUNT(*) AS total
            FROM operations
            WHERE app_user = '${selectedUser}' 
          )
          SELECT 
            oc.operation, 
            oc.operation_count, 
            (oc.operation_count * 100.0 / tc.total) AS percentage_usage
          FROM 
            operation_counts oc, 
            total_count tc
          ORDER BY 
            percentage_usage DESC;
        `;
      }
      if (selectedUser && selectedItem) {
        query = `
          WITH operation_counts AS (
            SELECT operation, COUNT(*) AS operation_count
            FROM operations
            WHERE application_name = '${selectedItem}' 
            AND app_user = '${selectedUser}'  
            GROUP BY operation
          ),
          total_count AS (
            SELECT COUNT(*) AS total
            FROM operations
            WHERE application_name = '${selectedItem}' 
            AND app_user = '${selectedUser}' 
          )
          SELECT 
            oc.operation, 
            oc.operation_count, 
            (oc.operation_count * 100.0 / tc.total) AS percentage_usage
          FROM 
            operation_counts oc, 
            total_count tc
          ORDER BY 
            percentage_usage DESC;
        `;
      }

      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch data from API");
        }

        const responseData = await response.json();
        setMessageFromServerFrequency(responseData);
      } catch (error) {
        console.error("Error fetching frequency data:", error);
        setMessageFromServerFrequency([]);
      } finally {
        setLoading(false);
      }
    };

    // Update the chart data when messageFromServerFrequency changes
    useEffect(() => {
      let newData = defaultData;
      let newAvg = 0;

      if (state.status === "success" && Array.isArray(messageFromServerFrequency) && messageFromServerFrequency.length > 0) {
        const newAvgValue = parseFloat(messageFromServerFrequency[0]?.percentage_usage || 0);
        newAvg = newAvgValue.toFixed(2);
        newData = [
          {
            group: "value",
            value: newAvgValue,
          },
        ];
      }

      setData(newData);
      setAvg(newAvg);
    }, [messageFromServerFrequency, state.status]);

    // Render the component
    return (
      <>
        {loading ? (
          <Tile className="infrastructure-components cpu-usage">
            <h4 className="title">
              Frequency Of Use
              <Button
                hasIconOnly
                renderIcon={InformationFilled}
                iconDescription="Frequency of use is the count of occurrences for each distinct operation within a dataset. It indicates how many times each type of operation has been recorded."
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
              Frequency Of Use
              <Button
                hasIconOnly
                renderIcon={InformationFilled}
                iconDescription="Frequency of use is the count of occurrences for each distinct operation within a dataset. It indicates how many times each type of operation has been recorded."
                kind="ghost"
                size="sm"
                className="customButton"
              />
            </h4>
            {data.length > 0 ? (
              <>
                <p>
                  <ul className="sub-title">
                    <li>
                      <strong>User Name:</strong> {selectedUser || "For All User Names"}
                    </li>
                    <li>
                      <strong>Application Name:</strong> {selectedItem || "For All Application Names"}
                    </li>
                  </ul>
                </p>
                <div className="cpu-usage-chart">
                  <GaugeChart data={data} options={options} />
                </div>
                <div className="cpu-usage-data">
                  <div className="label">Frequency of Use</div>
                  <h3 className="data">{avg} %</h3>
                </div>
              </>
            ) : (
              <NoData />
            )}
          </Tile>
        )}
      </>
    );
  }
);

export default FrequencyOfUse;
