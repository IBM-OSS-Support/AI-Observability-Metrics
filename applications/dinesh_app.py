from ibmroja import solve, inject_roja_instrumentation

# Load runtime variables
APPLICATION_NAME = "dinesh_application"
USER = "Dinesh"

inject_roja_instrumentation(APPLICATION_NAME, USER)
num = 38

solve(f'{USER}', f"What is {num} raised to .122231 power?")

print("Done")


