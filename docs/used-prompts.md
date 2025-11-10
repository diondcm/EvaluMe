# app-generator
´´´
Generates a Cloud Run Next.js application in a Docker container to execute a SPA application.
This application must have a simple login screen, at this point with fixed user/pass(devpost/#CloudRunHackathon -> the pass must be hashed)
After logging in, the application will display an upload button to select images only; these images will have a size limit of 100 MB.
Then, after the upload, the application will send the image to a back-end cloud run for processing.
Then, it will display a summary of the analysis over the image.
This on-screen report will be formatted as four sections, and at the end of the page, a button for downloading/sharing the report in a PDF format must be available.
---

# orchestrator
´´´
Generate a text analyzer agent workflow in Google Agent Development Kit(ADK).
Here are the agents and the desired workflow.
This application will be deployed as a Cloud Run app, without a visual interface.
The orchestrator app will receive an image as input in a REST method and provide multiple feedback analyses for each agent.
Also, the orchestrator must keep a cache and a status of the agents' execution.

Workflow:
1. Input Image over REST call
2. Start workflow
2.1 Extract text from the image
2.2 After the text extraction the orchestrator agent must start those parallel agents:
- linguistic analysis agent
- argumentative analysis agent
2.3 After each sug-agent finishes, the orchestrator must add its analysis to the final response.
2.4 Once all agents have finished the analysis, the orchestrator must return the consolidated report;

Agents:
Text extractor
  Input: Image
  Output text
  Model: flash-2.5
  Workflow: linear, only keeps execution after this agent has finished
linguistic analysis agent
  Input: text
  instructions: linguistics.md
  output: text analysis
  model: pro-.2.5
  workflow: all text analysis run in parallel
argumentative analysis agent
  Input: text
  instructions: argumentative.md
  output: text analysis
  model: pro-.2.5
  workflow: all text analysis run in parallel
---

# front-end
´´´
please, adapt this project to the new backend orchestractor created in the folder:
  "@\crc\agents\evaluator\README.md", instead of the application process the image after
  the upload, it must post it to the Cloud Run Orchestrator, and collect the feedback. Wille The orchestractor
  analyzes the image, this application must show a loading animation and monitor the status of the
  orchestractor.´
---

# local test
´´´
Great! How do I run this frontend app locally? If possible, make it request locally to the uvicorn on "127.0.0.1:8000" 
---