# EvaluMe
Helping you to improve your writing!

This project was created for the [Google Cloud Run Hackathon on Devpost](https://run.devpost.com/?_gl=1*og7f1v*_gcl_au*MTY1MTQxMzE5NC4xNzYxMjYwNTY2*_ga*NjQwMDM0NTQxLjE3NjEyNjA1Njc.*_ga_0YHJK3Y10M*czE3NjI3NDcyNTUkbzE0JGcxJHQxNzYyNzQ3Nzg5JGoxOCRsMCRoMA..).

## Objective

EvaluMe is a web application designed to help students evaluate their handwritten texts. It uses linguistic and semantic analysis to provide a detailed writing performance score.
Users can upload an image of their writing, specify the topic, and receive instant feedback on cohesion, coherence, grammar, and argumentation, all automatically and in an accessible format.
Developed primarily for teenagers preparing for exams and entrance tests, the app prioritizes user privacy and data security, empowering each student to improve their writing with confidence and independence.

## Application Architecture

The application is composed of a React-based frontend and a Python-based multi-agent backend.

### Frontend

The frontend is a single-page application built with [React](https://react.dev/), [Vite](https://vitejs.dev/), and [TypeScript](https://www.typescriptlang.org/). It provides a user-friendly interface for uploading images and viewing the analysis results.

For more details, see the [frontend README](./front-end/README.md).

### Backend

The backend is a multi-agent system built with Python and [FastAPI](https://fastapi.tiangolo.com/). It uses the [Google AI SDK for Python](https://ai.google.dev/docs/python_setup) to leverage the Gemini API for text extraction and analysis. The system is designed to run two specialized agents in parallel for linguistic and argumentative analysis.

For more details, see the [backend README](./multi-agent-back-end/README.md).

### Deployment

The entire application (both frontend and backend) is designed to be deployed on [Google Cloud Run](https://cloud.google.com/run).

## How It Works

1.  **Login:** The user logs in with the credentials `user: devpost` and `password: #CloudRunHackathon`.
2.  **Upload:** The user uploads an image of their handwritten text and provides a topic for the analysis.
3.  **Text Extraction:** The backend extracts the text from the uploaded image.
4.  **Parallel Analysis:** Two specialized agents analyze the extracted text in parallel:
    *   **Linguistic Analyzer:** Performs a general linguistic analysis of the text.
    *   **Argumentative Analyzer:** Analyzes the argumentative structure of the text based on the provided topic.
5.  **View Results:** The user can view the analysis from both agents and download a report.

## Privacy and Security

To protect the privacy of our users (especially teens), we have implemented the following measures:
*   **No User Registration:** We use hardcoded credentials to avoid collecting any personal information from users.
*   **No Data Storage:** The application does not store any of the uploaded images, extracted text, or analysis reports. The user has the option to download their report, but no data is kept on the server.