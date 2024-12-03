# README

# PRE-REQUISITES:

To get started with ai_observability_metrics, you will need the following:
1. Graphsignal API Key: To get an API key, sign up for a free account at graphsignal.com. The key can then be found in your account's Settings / API Keys page.
2. OpenAI API Key: To obtain an API Key, login at https://platform.openai.com/account/api-keys. Under "API keys", click "Create new secret key".
3. Docker: Docker needs to be pre-installed. 
   a. See: https://docs.docker.com/desktop/install/mac-install/
   b. Visit https://code.visualstudio.com/docs/containers/overview to install the docker extension
4. Python3: Ensure python3 is installed. 
   In command line terminal, Run: "brew install python3". After completion, run "pip3 -V" to ensure successful installation. 


# INSTALLATION
Under VSCode Extensions, search for "ai_observability_metrics" extension and click install. This will instal all the necessary libraries and components required for executing your AI Application. Allow around 2 minutes for installation to complete. 

# GET STARTED: 
1. Navigate to "ai_observability_metrics.py". Define the following variables in lines 9-12.
   a. GRAPHSIGNAL_API_KEY = "GRAPHSIGNAL_API_KEY_HERE"
   b. OPENAI_API_KEY = "OPENAI_API_KEY_HERE"
   c. APPLICATION_NAME = "APPLICATION_NAME_HERE"
   d. USER_NAME = "USERNAME_HERE"
   NOTE: You can also set these variables in lines 2-5 in "ai_observability_metrics_app.py". Variable names have to be the same. 
2. In "ai_observability_metrics_app.py" locate the "# INSERT CODE HERE" tag. You can start implementing the ai app after this line. 
3. When you are ready to run, run "python3 ai_observability_metrics_app.py" in the visual studio code command line. 

# VISUALIZATION
After running your application, navigate to your web browser and visit localhost:3000 and view metrics from your application. 

