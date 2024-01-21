from ibmroja import solve, inject_roja_instrumentation

# Load runtime variables
APPLICATION_NAME = "vikram_application"
USER = "Vikram"

inject_roja_instrumentation(APPLICATION_NAME, USER)

solve(f'{USER}', f"What is the cos of 38?")

print("Done")


