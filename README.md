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

## API

- `GET /api/recipes` and `GET /api/recipes/:id`
- `POST /api/recipes`
- `PUT /api/recipes/:id`
- `DELETE /api/recipes/:id`

Recipe payloads contain `name`, `category`, `ingredients` (array of strings), `steps` (array of strings), and `cookingTime` (positive number of minutes).