<p align="center">
  <img src="https://github.ibm.com/Support-OSS/roja-extention/blob/main/out/media/header.png" alt="header" />
</p>

<!-- ABOUT THE PROJECT -->
## About The Project
In this project, we are building an AI observer extension that leverages **Graphsignal** to collect important metrics on the application. These metrics can be visualized on a web browser user interface and then assessed to gain valuable insights on the execution. The seamless integration of Graphsignal with Visual Studio Code will allow developers to fine-tune their AI applications and by identifying bottlenecks- enhance their overall performance.

<table width="100%">
  <tr>
    <td align="left">
      <img src="https://github.ibm.com/Support-OSS/roja-extention/blob/main/out/media/ai_observability_metrics_writing.png" alt="ai_observability_metrics" style="vertical-align: middle;">
    </td>
    <td align="center" style="font-size: 40px; vertical-align: middle;">
      +
    </td>
    <td align="right">
      <img src="https://github.ibm.com/Support-OSS/roja-extention/blob/main/out/media/graphsignal.png" alt="graphsignal" style="vertical-align: middle;">
    </td>
  </tr>
</table>

</head>
<b>
    <h3>Reasons to Choose AI Observer</h3></b>
    <ul>
        <li><strong>Lightweight:</strong> This tool is very lightweight and resource friendly solution that requires almost no setup to get started. 
        <li><strong>Cost:</strong> Many of these tools are paid solutions which require investment by the organization. For larger organizations, this would often include paid support and maintenance contracts which can be extremely costly and slow to negotiate.</li>
    </ul>

</html>

<h3>Workflow of AI Observer</h3>
<p>AI Observer uses the Graphsignal opensource library, which has very low overhead and is optimized for enterprise software development workflows and performs well across a range of observability tasks (e.g. usage analysis, code optimization and model evaluation), making it an easy and lightweight.</p>

<p>The workflow diagram of AI Observer is provided below.</p>

<p align="center">
  <img src="https://github.ibm.com/Support-OSS/roja-extention/blob/main/out/media/workflow.png" alt="header" width="600" height="500" />
</p>



<!-- GETTING STARTED -->
## Getting Started 
Following are the instructions to setting up AI Observer locally.
To get a local copy up and running follow the steps.

### Prerequisites

<h4>For using <code>AI Observer</code>, you need:</h4>
<ul>
    <li><strong>OS:</strong> Mac</li>
    <li><strong>DISK SPACE:</strong> Minimum 30GB</li>
    <li><strong>Terminal:</strong> Homebrew (for Mac) </li>
    <li><strong>IDE:</strong> Visual Studio Code (<a href="https://code.visualstudio.com/download">VSCode</a>)</li>
    <li><strong>Container:</strong> Docker (see (<a href="https://docs.docker.com/desktop/install/mac-install/">here</a>) for installation) </li>
    <li><strong>Python3:</strong> If not already installed, run <strong>brew install python3</strong>. After completion, run <strong>pip3 -V</strong> to ensure successful installation. </li>


</ul>

<body>
    <h4>How to install AI Observer on macOS</h4>
    <p>Under VSCode extensions, search for <code>AI Observer</code> extension and click install. This will install all the necessary libraries and components required for execution your AI Application. </p>
</body>

 <p>Here is a walkthrough of how to install the script on macOS:</p>
    <ol>
        <li>Navigate to <code>ai_observability_metrics.py</code>. Define the following variables in lines 9-12.
            <ol type="a">
                <li><pre><code>GRAPHSIGNAL_API_KEY = "GRAPHSIGNAL_API_KEY_HERE"</code></pre></li>
                <li><pre><code>OPENAI_API_KEY = "OPENAI_API_KEY_HERE"</code></pre></li>
                <li><pre><code>APPLICATION_NAME = "APPLICATION_NAME_HERE"</code></pre></li>
                <li><pre><code>USER_NAME = "USER_NAME_HERE"</code></pre></li>
            </ol>
        </li>
        <p>Note: You can also define these variables within <code>ai_observability_metrics_app.py</code> in lines 3-6. See recording for details. </p>
        <li>In <code>ai_observability_metrics_app.py</code> locate the <code># INSERT CODE HERE"</code> tag. You can start implementing your code after this line.</li>
        <li>Run your code using the following command:</li>
        <pre><code>python3 ai_observability_metrics_app.py</code></pre>
    </ol>

 <p>Here is a walkthrough of how to use the AI Observer tool:</p>

<p align="center">
  <video src="https://github.ibm.com/Support-OSS/roja-extention/blob/main/out/media/vid_v3.mov" width="600" controls>
    Your browser does not support the video tag.
  </video>
</p>
https://github.ibm.com/Support-OSS/roja-extention/blob/main/out/media/vid_v3.mov

 
 <h3>Visualization</h3>
<p>After your application and run to completion, you can view your metrics by opening any web browser and visiting <pre><code>localhost:3000</code></pre> </p>

## Next Steps 
<p><li>Enhanced integration to handle multiple users and executions simultaneously</li></p>
<p><li>Extend functionality to Windows </li></p>



