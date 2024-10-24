import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { CodeSnippetSkeleton, Tile } from "@carbon/react";
import { MeterChart } from "@carbon/charts-react";
import { useStoreContext } from "../../../store";
import NoData from "../../common/NoData/NoData";

const getColorByValue = (value) => {
  if (value >= 8) return "#00bfae"; // Excellent
  if (value >= 4) return "#f1c21b"; // Good
  return "#f46666"; // Bad
};

const getStatusText = (value) => {
  if (value >= 8) return "Excellent";
  if (value >= 4) return "Good";
  return "Bad";
};

const options = (color, statusText) => ({
  theme: "g90",
  resizable: true,
  height: "80%",
  width: "100%",
  meter: {
    proportional: {
      total: 10,
      totalFormatter: (e) => statusText,
      breakdownFormatter: (e) =>
        `The accuracy score of the application is ${e.datasetsTotal.toFixed(
          2
        )} out of 10`,
    },
    height: "70%",
    width: "150%",
  },
  color: {
    pairing: {
      option: 2,
    },
  },
  toolbar: {
    enabled: false,
  },
});

const defaultData = [
  {
    group: "",
    value: 0,
  },
];

const Accuracy = forwardRef(
  ({ selectedItem, selectedUser, startDate, endDate }, ref) => {
    const [data, setData] = useState(defaultData);
    const [avg, setAvg] = useState(0);
    const [messageFromServerAccuracy, setMessageFromServerAccuracy] =
      useState(null);
    const [chartOptions, setChartOptions] = useState(options("#f46666", "Bad")); // Default options

    const { state } = useStoreContext();
    const [loading, setLoading] = useState(true); // Add loading state

    useImperativeHandle(ref, () => ({
      fetchAccuracyData,
    }));

    const fetchAccuracyData = async (
      selectedItem,
      selectedUser,
      startDate,
      endDate
    ) => {
      let query = "SELECT * FROM accuracy";

      // Add filtering logic based on selectedItem, selectedUser, and selectedTimestampRange
      if (selectedItem && !selectedUser) {
        query += ` WHERE application_name = '${selectedItem}'`;
      }
      if (selectedUser && !selectedItem) {
        query += ` WHERE app_user = '${selectedUser}'`;
      }
      if (selectedUser && selectedItem) {
        query += ` WHERE application_name = '${selectedItem}' AND app_user = '${selectedUser}'`;
      }

      try {
        const apiUrl = process.env.REACT_APP_BACKEND_API_URL; // Make sure your API URL is correctly set in env
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch accuracy data");
        }

        var responseData = await response.json();
        setMessageFromServerAccuracy(responseData); // Assuming the data is in the correct format
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        if (Array.isArray(responseData) && responseData.length > 0) {
          setLoading(false); // Stop loading
        }else {
          setLoading(false); // Stop loading in case of empty data or error
      }
      }
    };

    useEffect(() => {
      fetchAccuracyData(selectedItem, selectedUser, startDate, endDate);
    }, [selectedItem, selectedUser, startDate, endDate]);

    useEffect(() => {
      if (messageFromServerAccuracy && state.status === "success") {
        let filteredData = messageFromServerAccuracy;

        if (startDate && endDate) {
          const convertUTCToIST = (utcDateString) => {
            const utcDate = new Date(utcDateString);
            const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
            return new Date(utcDate.getTime() + istOffset); // Returns a Date object in IST
          };

          filteredData = messageFromServerAccuracy.filter((accuracy) => {
            const timestamp = convertUTCToIST(accuracy.timestamp);
            return timestamp >= startDate && timestamp <= endDate;
          });
        }

        const accuracyScore = filteredData.map((d) => d.accuracy_score || 0);

        const newAvgValue =
          accuracyScore.reduce((s, g) => s + +g, 0) / accuracyScore.length;
        const newAvg = newAvgValue.toFixed(2);

        const newData = [
          {
            group: "Accuracy score",
            value: newAvgValue, // Ensure the value is between 0 and 10
          },
        ];

        // Determine chart color and status text based on the average value
        const chartColor = getColorByValue(newAvgValue);
        const statusText = getStatusText(newAvgValue);

        setData(newData);
        setAvg(newAvg);
        setChartOptions(options(chartColor, statusText, startDate, endDate));
      }
    }, [messageFromServerAccuracy, state.status]);

    return (
      <Tile className="infrastructure-components accuracy">
        <h4 className="title">Accuracy Score</h4>
        {loading ? (
          <>
            <CodeSnippetSkeleton type="multi" />
            <CodeSnippetSkeleton type="multi" />
          </>
        ) : (
          <>
            <p>
              <ul className="sub-title">
                <li>
                  <strong>User Name:</strong>{" "}
                  {`${selectedUser || "For All User Name"}`}
                </li>
                <li>
                  <strong>Application Name:</strong>{" "}
                  {`${selectedItem || "For All Application Name"}`}
                </li>
              </ul>
            </p>
            <div className="cpu-usage-chart">
              {avg > 0 ? (
                <MeterChart data={data} options={chartOptions} />
              ) : (
                <NoData />
              )}
            </div>
            <div className="cpu-usage-data">
              {avg > 0 ? (
                <>
                  <div className="label">
                    {selectedUser && selectedItem
                      ? `Average accuracy of ${selectedItem || "All"} is`
                      : `Average accuracy of ${
                          selectedUser || "All"
                        } Application is`}
                  </div>
                  <h3 className="data">{avg}/10</h3>
                </>
              ) : (
                <div className="label"></div>
              )}
            </div>
          </>
        )}
      </Tile>
    );
  }
);

export default Accuracy;
