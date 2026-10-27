# Recipe Book

A responsive recipe manager. It uses MongoDB through the Express API when configured, and browser-local storage when hosted on GitHub Pages without an API URL.

## Requirements

- Node.js 20 or newer
- A MongoDB Atlas cluster and database user

## Run locally

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and set `MONGODB_URI` to your Atlas connection string.
3. Run `npm run dev` and open the URL printed by Vite (normally `http://localhost:5173`).

The API runs on port 5000 and Vite forwards `/api` requests to it. `npm run build` creates the client production bundle, and `npm start` serves that bundle from the Express server.

## Deploy the frontend on GitHub Pages

GitHub Pages hosts the React frontend; it does not run the Express API. The Pages site works without a backend by storing recipes in the current browser's local storage. Recipes saved this way do not sync across browsers or devices.

1. In GitHub, open **Settings** → **Pages** and select **GitHub Actions** as the deployment source.
2. Push to `main` or run the **Deploy to GitHub Pages** workflow. The site will be published at `https://jiyo444.github.io/exam/`.
3. To use MongoDB instead of browser-local storage, deploy the optional API below and create the `VITE_API_URL` Actions variable with its public URL. Do not include a trailing slash.

## Optional MongoDB API on Render

1. In Render, choose **New +** → **Blueprint**, then connect this repository. Render reads `render.yaml` and builds the React app and Express API as one web service.
2. When prompted, set `MONGODB_URI` to your MongoDB Atlas connection string in Render's environment settings. Do not commit `.env` or paste database credentials into source files.
3. In Atlas, allow network access from the deployed service, then wait for the Render deploy to finish. Use the Render service URL as the `VITE_API_URL` GitHub Actions variable above.

## API

- `GET /api/recipes` and `GET /api/recipes/:id`
- `POST /api/recipes`
- `PUT /api/recipes/:id`
- `DELETE /api/recipes/:id`

Recipe payloads contain `name`, `category`, `ingredients` (array of strings), `steps` (array of strings), and `cookingTime` (positive number of minutes).