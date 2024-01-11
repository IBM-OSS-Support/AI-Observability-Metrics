import os
import json

# Specify the path where JSON files are stored
json_file_path = "/Users/lakshmi/codeworkspace/GraphSignalPOC/visualize/signals"
performance_data = []


def get_metrics():
    if os.path.exists(json_file_path):
        # Read JSON files
        file_path = os.path.join(json_file_path,"json_output_metrics_2.json")
        with open(file_path, 'r') as file:
                data = json.load(file)
                metrics_data=data['metrics']
    
    return metrics_data
            #print(metrics_data)

#Create dictionary for metrics of different scope
def get_scope_data(metrics_data,scope):
    scope_data = [metric for metric in metrics_data if metric.get("scope") == scope]
    return scope_data

def get_scope_operation_values(scope_data):
    scope_operation_values = list(set([metric["tags"][1]["value"] for metric in scope_data if metric.get("tags") and metric["tags"][1].get("key") == "operation"]))
    return scope_operation_values

def get_performance_metrics_dict(performance_operation_values):
    perf_met = {}
        # Iterate over the unique "operation" values
    for operation in performance_operation_values:
        # Extract data metrics for the current operation
        operation_metrics = [metric for metric in performance_data if metric.get("tags") and len(metric["tags"]) > 1 and metric["tags"][1].get("value") == operation]
        # Initialize nested dictionary for the current operation
        perf_met[operation] = {}
        # Iterate over metrics for the current operation
        for metric in operation_metrics:
            # Extract metric name and type
            metric_name = metric.get("name")
            metric_type = "COUNTER_METRIC"  # Assuming default type is COUNTER_METRIC
            # Extract counter value if available
            counter_val = metric.get("counter")
        # Check if the metric name is one of the specified names
            if metric_name in ["call_count","exception_count"]:
                # Extract counter value if available
                metric_value = int(metric.get("counter"))
                metric_type = "COUNTER_METRIC"

            if metric_name in ['latency','latency_distribution']:
                if "histogram" in metric:
                    metric_value = {
                        'bins': metric["histogram"].get("bins"),
                        'counts': metric["histogram"].get("counts")
                    }
                    metric_type = "HISTOGRAM_METRIC"
                else:
                    metric_value = None
                    metric_type = None
            # Add the metric information to the det_met dictionary
            perf_met[operation][metric_name] = {'val': metric_value, 'type': metric_type}
    return perf_met


def get_data_metrics_dict(data_operation_values):
    data_met = {}
    # Iterate over the unique "operation" values
    for operation in data_operation_values:
        # Extract data metrics for the current operation
        operation_metrics = [metric for metric in Data_data if metric.get("tags") and len(metric["tags"]) > 1 and metric["tags"][1].get("value") == operation]
        # Initialize nested dictionary for the current operation
        data_met[operation] = {}
        # Iterate over metrics for the current operation
        for metric in operation_metrics:
            # Extract metric name and type
            #print("printing metric")
            #print(metric)
            metric_name = metric.get("name")
            # Check if the metric name is one of the specified names
            if metric_name in ["char_count", "element_count", "token_count"]:
                metric_type = "COUNTER_METRIC"  # Assuming default type is COUNTER_METRIC
                # Extract counter value if available
                counter_val = int(metric.get("counter"))
                #get_data_category
                # Extract data category value from the "data" tag
                data_category = None
                for tag in metric.get("tags", []):
                    if tag.get("key") == "data":
                        data_category = tag.get("value")
                        break
                data_met[operation].setdefault(data_category, {})
                data_met[operation][data_category][metric_name] = {'val': counter_val, 'type': metric_type}
    return data_met


def get_system_metrics_dict(system_data):
    system_met = {}
        # Filter system metrics based on the specified names
    system_metrics = [metric for metric in system_data if metric.get("name") in ["process_cpu_usage", "process_memory", "virtual_memory", "node_memory_used"]]
    # Creating a dictionary for system metrics
    system_met = {}
    # Iterate over system metrics
    for metric in system_metrics:
        # Extract metric name and type
        metric_name = metric.get("name")
        # Initialize metric type
        metric_type = None
        # Check if the metric is a GAUGE_METRIC or not
        if metric.get("type") == "GAUGE_METRIC":
            metric_type = "GAUGE_METRIC"
        # Extract gauge value if available
        gauge_val = metric.get("gauge")
        # Add the metric information to the system_met dictionary
        system_met[metric_name] = {'val': gauge_val, 'type': metric_type}
    return system_met

# Extracting deployment name, model name, and user name from metrics
def get_static_values():
    deployment = metrics_data[0]["tags"][0]["value"]
    model = metrics_data[0]["tags"][6]["value"]
    user = metrics_data[0]["tags"][3]["value"]
    return deployment, model, user


metrics_data = get_metrics()
performance_data = get_scope_data(metrics_data, scope="performance")
Data_data = get_scope_data(metrics_data, scope="data")
system_data = get_scope_data(metrics_data, scope="system")
cost_data = get_scope_data(metrics_data, scope="cost")
print(f"len of performance_data : {len(performance_data)},\
        len of data : {len(Data_data)}\
        len of system_data : {len(system_data)}\
        len of cost_data : {len(cost_data)}")

performance_operation_values = get_scope_operation_values(performance_data)
data_operation_values = get_scope_operation_values(Data_data)
system_operation_values = get_scope_operation_values(system_data)
cost_operation_values = get_scope_operation_values(cost_data)

# performance_operation_values = list(set([metric["tags"][1]["value"] for metric in performance_data if metric.get("tags") and metric["tags"][1].get("key") == "operation"]))
# data_operation_values = list(set([metric["tags"][1]["value"] for metric in Data_data if metric.get("tags") and metric["tags"][1].get("key") == "operation"]))
# system_operation_values = list(set([metric["tags"][1]["value"] for metric in system_data if metric.get("tags") and metric["tags"][1].get("key") == "operation"]))
# cost_operation_values = list(set([metric["tags"][1]["value"] for metric in cost_data if metric.get("tags") and metric["tags"][1].get("key") == "operation"]))

#PERFORMANCE
perf_metrics_dict = get_performance_metrics_dict(performance_operation_values)
print(perf_metrics_dict)
print("===================================================================================================================")
# #DATA
data_metrics_dict = get_data_metrics_dict(data_operation_values)
print(data_metrics_dict)
print("===================================================================================================================")

# #SYSTEM
system_metrice_dict = get_system_metrics_dict(system_data)
print(system_metrice_dict)
print("===================================================================================================================")


#static values
deployment, model, user = get_static_values()
# Display the extracted values
print("Deployment:", deployment)
print("Model:", model)
print("User:", user)
