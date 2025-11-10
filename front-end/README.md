# Text Analysis Web Interface

This project is the frontend for a multi-agent backend system that analyzes text. This web interface allows users to upload text, process it, and download the analysis results.

## Project Structure

The project is a single-page application built with React and Vite. The main components are:

- `src/`: Contains the main application logic.
- `components/`: Contains the React components.
- `services/`: Contains the services for interacting with the backend API.
- `server/`: Contains a Node.js proxy server to securely communicate with the backend.
- `public/`: Contains the public assets.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/)

### Installation

1. Clone the repository.
2. Install the dependencies:

   ```bash
   npm install
   ```

### Running the Development Server

To run the development server, use the following command:

```bash
npm run dev
```

This will start the development server on `http://localhost:3000`.

## Building for Production

To build the project for production, use the following command:

```bash
npm run build
```

This will create a `dist` directory with the production-ready files.

## Deployment

This project can be deployed as a static website or with the provided Node.js proxy server. For more information on deploying to Google Cloud, please refer to the official documentation.