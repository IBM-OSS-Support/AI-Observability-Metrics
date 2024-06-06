# import anthropic
from ibmroja import run_anthropic_model, inject_roja_instrumentation

# Load runtime variables
APPLICATION_NAME = "Anthropic_application"
USER = "Harsh"

inject_roja_instrumentation(APPLICATION_NAME, USER)

question = "What are your views on pineapple on pizza?"
response = run_anthropic_model(USER, question)

#print("Done")

# api_key='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'

print("Response: ", response) # TESTING
print("")
print("Model Name: ", response.model) # TESTING

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