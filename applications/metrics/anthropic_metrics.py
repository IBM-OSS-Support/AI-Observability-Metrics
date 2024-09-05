import json

APPLICATION_METRIC = "anthropic_metrics"
app_name = "Anthropic"

def anthropic_metrics_json(data, response):

    model_name = response.model
    input_count = response.usage.input_tokens
    output_count = response.usage.output_tokens
    input_cost_per_million_tokens = 0
    output_cost_per_million_tokens = 0

    if model_name == "claude-3-opus-20240229":
        input_cost_per_million_tokens = 15
        output_cost_per_million_tokens = 75
    elif model_name == "claude-3-sonnet-20240229":
        input_cost_per_million_tokens = 3
        output_cost_per_million_tokens = 15
    elif model_name == "claude-3-haiku-20240229":
        input_cost_per_million_tokens = 0.25
        output_cost_per_million_tokens = 1.25

    input_cost = input_count/1000000 * input_cost_per_million_tokens
    output_cost = output_count/1000000 * output_cost_per_million_tokens

    print("Input Tokens: ", input_count)
    print("Output Tokens: ", output_count)

    total_cost = input_cost + output_cost

    print("Input Cost: $", input_cost)
    print("Output Cost: $", output_cost)
    print("Total Cost: $", total_cost)

    data["kafka-topic"] = APPLICATION_METRIC
    data["app-user"] = data['user']
    data["application-name"] = app_name
    data["model_name"] = response.model
    data["input_count"] = response.usage.input_tokens
    data["output_count"] = response.usage.output_tokens
    data["input_cost"] = input_cost
    data["output_cost"] = output_cost
    data["total_cost"] = total_cost

    # Write the system info to a JSON file
    with open("metrics/jsons/anthropic_accuracy.json", "w") as json_file:
        json.dump(data, json_file, indent=4)
    return data
