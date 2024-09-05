import json
import platform
import sys
import openai
import subprocess
import graphsignal

APPLICATION_METRIC = "maintenance"

def get_os_info():
    return platform.platform()

def get_machine_architecture():
    return platform.machine()

def get_python_version():
    return sys.version

def get_openai_version():
    return openai.__version__

def get_installed_packages():
    pip_list_output = subprocess.check_output(["pip", "list"]).decode()
    return pip_list_output

def generate_system_info(user, app_name):
    system_info = {
        "kafka-topic":APPLICATION_METRIC,
        "OperatingSystem": get_os_info(),
        "MachineArchitecture": get_machine_architecture(),
        "PythonVersion": get_python_version(),
        "OpenAIVersion": get_openai_version(),
        "app-user":user,
        "application-name":app_name
    }
    return system_info

def get_maintenance_info(user, app_name):
    system_info = generate_system_info(user, app_name)

    # Write the system info to a JSON file
    with open("metrics/jsons/system_info.json", "w") as json_file:
        json.dump(system_info, json_file, indent=4)

    print("System information has been written to system_info.json")
    return system_info
