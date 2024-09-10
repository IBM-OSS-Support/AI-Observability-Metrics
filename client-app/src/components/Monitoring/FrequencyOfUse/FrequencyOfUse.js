import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import moment from "moment";
import { Button, Tile } from "@carbon/react";
import { GaugeChart } from "@carbon/charts-react";
import { getAppData } from "../../../appData";
import { useStoreContext } from "../../../store";
import { InformationFilled } from "@carbon/icons-react";

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

const defaultMessage = [
  {
    percentage_usage: 0,
  },
];

const FrequencyOfUse = forwardRef(({ selectedItem, selectedUser, startDate, endDate }, ref) => {
  const [data, setData] = useState(defaultData);
  const [avg, setAvg] = useState(0);
  const [messageFromServerFrequency, setMessageFromServerFrequency] =
    useState(defaultMessage);

  const { state } = useStoreContext();

  useImperativeHandle(ref, () => ({
    fetchFrequencyData,
  }));

  // Function to fetch data from the API
  const fetchFrequencyData = async () => {
    const apiUrl = process.env.REACT_APP_BACKEND_API_URL;

    console.log("apiUrl:", apiUrl);

    const query = `WITH operation_counts AS ( SELECT operation, COUNT(*) AS operation_count FROM operations GROUP BY operation ), total_count AS ( SELECT COUNT(*) AS total FROM operations ) SELECT oc.operation, oc.operation_count, (oc.operation_count * 100.0 / tc.total) AS percentage_usage FROM operation_counts oc, total_count tc ORDER BY percentage_usage DESC;`;

    // Add filtering logic based on selectedItem, selectedUser, startDate, and endDate
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
      const response = await fetch(`${apiUrl}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch data from API");
      }

      const data = await response.json();
      setMessageFromServerFrequency(data);
    } catch (error) {
      console.error("Error fetching frequency data:", error);
    }
  };

  // Update the chart data when messageFromServerFrequency changes
  useEffect(() => {
    let newData = defaultData;
    let newAvg = 0;

    if (state.status === "success") {
      const appData = getAppData();
      console.log("Frequency app data", appData[0].data);

      if (messageFromServerFrequency) {
        const newAvgValue = parseFloat(
          messageFromServerFrequency[0].percentage_usage
        );
        console.log("Frequency newAvgValue", newAvgValue);

        newAvg = newAvgValue.toFixed(2);
        newData = [
          {
            group: "value",
            value: newAvgValue || 0,
          },
        ];

        setData(newData);
        setAvg(newAvg);
        console.log("New average usage", newAvg);
      }
    }
  }, [messageFromServerFrequency, state.status]);

  console.log("Frequency messageFromServer", messageFromServerFrequency);

  // Render the component
  return (
    <Tile className="infrastructure-components cpu-usage">
      <h5>Frequency of Use
      <Button
          hasIconOnly
          renderIcon={InformationFilled}
          iconDescription="Frequency of use is the count of occurrences for each distinct operation within a dataset. 
          It indicates how many times each type of operation has been recorded."
          kind="ghost"
          size="sm"
          className="customButton"
        />
      </h5>
      <div className="cpu-usage-chart">
        <GaugeChart data={data} options={options} />
      </div>
      <div className="cpu-usage-data">
        <div className="label">Frequency of Use</div>
        <h3 className="data">{avg} %</h3>
      </div>
    </Tile>
  );
});

export default FrequencyOfUse;
