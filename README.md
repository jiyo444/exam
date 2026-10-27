# Recipe Book

A responsive MERN recipe manager. Recipes are persisted in MongoDB through the Express API.

## Requirements

- Node.js 20 or newer
- A MongoDB Atlas cluster and database user

## Run locally

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and set `MONGODB_URI` to your Atlas connection string.
3. Run `npm run dev` and open the URL printed by Vite (normally `http://localhost:5173`).

The API runs on port 5000 and Vite forwards `/api` requests to it. `npm run build` creates the client production bundle, and `npm start` serves that bundle from the Express server.

## Deploy on Render

1. Push this repository to GitHub.
2. In Render, choose **New +** → **Blueprint**, then connect this repository. Render reads `render.yaml` and builds the React app and Express API as one web service.
3. When prompted, set `MONGODB_URI` to your MongoDB Atlas connection string in Render's environment settings. Do not commit `.env` or paste database credentials into source files.
4. In Atlas, allow network access from the deployed service, then wait for the Render deploy to finish. Open the service URL shown by Render.

The app and `/api` endpoints share the same hosted origin, so no separate frontend API URL is needed.

## API

- `GET /api/recipes` and `GET /api/recipes/:id`
- `POST /api/recipes`
- `PUT /api/recipes/:id`
- `DELETE /api/recipes/:id`

Recipe payloads contain `name`, `category`, `ingredients` (array of strings), `steps` (array of strings), and `cookingTime` (positive number of minutes).