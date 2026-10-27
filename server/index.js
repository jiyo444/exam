import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import recipesRouter from './routes/recipes.js';

const app = express();
const port = Number(process.env.PORT) || 5000;
const clientDist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../client/dist');

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.get('/api/health', (req, res) => {
  res.json({ database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});
app.use('/api/recipes', recipesRouter);
app.use(express.static(clientDist));
app.get('*', (req, res) => res.sendFile(path.join(clientDist, 'index.html')));
app.use((error, req, res, next) => {
  console.error(error);
  const status = error.name === 'ValidationError' ? 400 : 500;
  res.status(status).json({ message: status === 400 ? error.message : 'Something went wrong while handling the request.' });
});

app.listen(port, () => console.log(`Recipe Book API listening on port ${port}`));

if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log('Connected to MongoDB Atlas');
  }).catch((error) => {
    console.error(`MongoDB connection failed: ${error.message}`);
  });
} else {
  console.warn('MONGODB_URI is not set. Add it to .env to enable recipe storage.');
}