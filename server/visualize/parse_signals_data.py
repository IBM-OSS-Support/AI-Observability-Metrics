import os
import json
import base64

# Specify the path where JSON files are stored
json_file_path = "/Users/lakshmi/codeworkspace/GraphSignalPOC/visualize/signals"



def get_signals():
    if os.path.exists(json_file_path):
        # Read JSON files
        file_path = os.path.join(json_file_path,"json_output_1.json")
        with open(file_path, 'r') as file:
                data = json.load(file)
                signals_data=data['spans']
    
    return signals_data

# def parse_model_parameters(signal_data):
#     temperature = [param['value'] for param in signal_data[0].get('params', []) if param['name'] == 'temperature']
#     n = [param['value'] for param in signal_data[0].get('params', []) if param['name'] == 'n']
#     stream = [param['value'] for param in signal_data[0].get('params', []) if param['name'] == 'stream']
#     stop = [param['value'] for param in signal_data[0].get('params', []) if param['name'] == 'stop']
#     return temperature[0], n[0], stream[0], stop[0]


def decode_base64(encoded_string):
    try:
        # Decode the base64-encoded string using UTF-8 encoding
        decoded_bytes = base64.b64decode(encoded_string)
        
        # Convert bytes to string using UTF-8
        decoded_string = decoded_bytes.decode('utf-8')
        
        return decoded_string
    except Exception as e:
        # Handle decoding errors
        print(f"Error decoding base64: {e}")
        return None
    
libraries = ", "
signal_data = get_signals()
libraries = libraries.join(list(set([lib['name'] for signal in signal_data for lib in signal.get('libraries', [])])))

# Printing the extracted values
temperature = [param['value'] for param in signal_data[0].get('params', []) if param['name'] == 'temperature'][0]
n = [param['value'] for param in signal_data[0].get('params', []) if param['name'] == 'n'][0]
stream = [param['value'] for param in signal_data[0].get('params', []) if param['name'] == 'stream'][0]
stop = [repr(param['value']) for param in signal_data[0].get('params', []) if param['name'] == 'stop'][0]
print(stop)


input_bytes = [dataSamples['contentBytes'] for dataSamples in signal_data[-1].get('dataSamples', []) if dataSamples['dataName'] == 'inputs'][0]
actions_bytes = [dataSamples['contentBytes'] for dataSamples in signal_data[-1].get('dataSamples', []) if dataSamples['dataName'] == 'actions'][0]
ourput_bytes = [dataSamples['contentBytes'] for dataSamples in signal_data[-1].get('dataSamples', []) if dataSamples['dataName'] == 'outputs'][0]

input_decoded = decode_base64(input_bytes)
action_decoded = decode_base64(actions_bytes)
output_decoded = decode_base64(ourput_bytes)
print(input_decoded)