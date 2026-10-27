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

## Deploy the frontend on GitHub Pages

GitHub Pages hosts the React frontend; it does not run the Express API. Deploy the API first using the Render instructions below.

1. In GitHub, open **Settings** → **Pages** and select **GitHub Actions** as the deployment source.
2. Open **Settings** → **Secrets and variables** → **Actions** → **Variables**, then create `VITE_API_URL` with the public URL of your Render API (for example, `https://recipe-book.onrender.com`). Do not include a trailing slash.
3. Push to `main` or run the **Deploy to GitHub Pages** workflow. The site will be published at `https://jiyo444.github.io/exam/`.

## Deploy the API on Render

1. In Render, choose **New +** → **Blueprint**, then connect this repository. Render reads `render.yaml` and builds the React app and Express API as one web service.
2. When prompted, set `MONGODB_URI` to your MongoDB Atlas connection string in Render's environment settings. Do not commit `.env` or paste database credentials into source files.
3. In Atlas, allow network access from the deployed service, then wait for the Render deploy to finish. Use the Render service URL as the `VITE_API_URL` GitHub Actions variable above.

## API

- `GET /api/recipes` and `GET /api/recipes/:id`
- `POST /api/recipes`
- `PUT /api/recipes/:id`
- `DELETE /api/recipes/:id`

Recipe payloads contain `name`, `category`, `ingredients` (array of strings), `steps` (array of strings), and `cookingTime` (positive number of minutes).