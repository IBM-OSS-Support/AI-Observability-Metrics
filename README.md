![Tittle](doc/media/AiObservability-title.png)

<!-- ABOUT THE PROJECT -->
## About The Project
In this project, we are building an `AI Observability Metrics extension `that leverages **Graphsignal** to collect important metrics on the application, providing key metrics through a redesigned, user-friendly web interface powered by the Carbon Design System. It features advanced filters, zooming for detailed analysis, and new metrics like GPU/CPU usage,* add more about new Metics*. These metrics can be visualized on a web browser user interface and then assessed to gain valuable insights on the execution. The seamless integration of Graphsignal with Visual Studio Code will allow developers to fine-tune their AI applications and by identifying bottlenecks- enhance their overall performance.

![Ai-Observability+graphsignal](doc/media/AiObservability-graphsignal.png)


### Reasons to Choose AI Observability Metrics

- **Lightweight:** This tool is very lightweight and resource friendly solution that requires almost no setup to get started. 
- **Cost:** Many of these tools are paid solutions which require investment by the organization. For larger organizations, this would often include paid support and maintenance contracts which can be extremely costly and slow to negotiate.

### Workflow of AI Observability Metrics

AI Observability Metrics uses the Graphsignal opensource library, which has very low overhead and is optimized for enterprise software development workflows and performs well across a range of observability tasks (e.g. usage analysis, code optimization and model evaluation), making it an easy and lightweight.

The workflow diagram of AI Observability Metrics is provided below.

![Workflow](doc/media/workflow.png){ width=60% }
<!-- GETTING STARTED -->
## Getting Started 
Following are the instructions to setting up AI Observability Metrics locally.
To get a local copy up and running follow the steps.

### Prerequisites

For using `AI Observability Metrics`, you need:
- **OS:** Mac
- **DISK SPACE:** Minimum 30GB
- **Terminal:**  Homebrew (for Mac)
- **IDE:** [Visual Studio Code](https://code.visualstudio.com/download)
- **Docker:** installed [for Mac](https://docs.docker.com/desktop/install/mac-install/)
- **Python3:** If not already installed, run `brew install python3`. After completion, run `pip3 -V`ensure successful installation.
- **Graphsignal API Key:** To get an API key, sign up for a [free account](graphsignal.com]). The key can then be found in your account's Settings / API Keys page.
- **OpenAI API Key:** To obtain an API Key, login [here](https://platform.openai.com/account/api-keys). Under "API keys", click "Create new secret key".**


### How to install AI Observability Metrics on macOS
Under VSCode extensions, search for `AI Observability Metrics` extension and click install. This will install all the necessary libraries and components required for execution your AI Application.Allow around 2 minutes for installation to complete.



Here is a walkthrough of how to install the script on macOS:

1.Navigate to `<your_code.py>`. Define the following variables
            
```
GRAPHSIGNAL_API_KEY = "GRAPHSIGNAL_API_KEY_HERE"

OPENAI_API_KEY = "OPENAI_API_KEY_HERE"

APPLICATION_NAME = "APPLICATION_NAME_HERE"

USER_NAME = "USER_NAME_HERE"
```
for example : Navigate to `ai_observer.py`. Define the following variables in lines 9-12.

Note: You can also define these variables within `ai_observer_app.py` in lines 3-6. See recording for details.

2. In `ai_observer_app.py` locate the `# INSERT CODE HERE"` tag. You can start implementing your code after this line.
3. Run your code using the following command:
 
    `python3 ai_observer_app.py`
    

Here is a walkthrough of how to use the AI Observability Metrics tool:

***add gif here***

 
 ### Visualization
After your application and run to completion, you can view your metrics by opening any web browser and visiting 

`localhost:3000`

## Next Steps 
* Enhanced integration to handle multiple users and executions simultaneously 
* Extend functionality to Windows 



