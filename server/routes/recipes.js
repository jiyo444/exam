import { Router } from 'express';
import mongoose from 'mongoose';
import Recipe, { CATEGORIES } from '../models/Recipe.js';

const router = Router();
const fields = ['name', 'category', 'ingredients', 'steps', 'cookingTime'];

function validatePayload(payload) {
  const errors = [];
  if (typeof payload.name !== 'string' || !payload.name.trim()) errors.push('Recipe name is required.');
  if (typeof payload.name === 'string' && payload.name.trim().length > 100) errors.push('Recipe name must be 100 characters or fewer.');
  if (!CATEGORIES.includes(payload.category)) errors.push('Choose a valid recipe category.');
  for (const field of ['ingredients', 'steps']) {
    if (!Array.isArray(payload[field]) || payload[field].length === 0 || payload[field].some((item) => typeof item !== 'string' || !item.trim())) {
      errors.push(field === 'ingredients' ? 'Add at least one non-empty ingredient.' : 'Add at least one non-empty preparation step.');
    }
  }
  if (!Number.isInteger(Number(payload.cookingTime)) || Number(payload.cookingTime) < 1) {
    errors.push('Cooking time must be a positive whole number of minutes.');
  }
  return errors;
}

function pickPayload(body) {
  return Object.fromEntries(fields.map((field) => [field, body[field]]));
}

function checkDatabase(req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: 'The recipe database is not connected. Check the MongoDB Atlas connection settings.' });
  }
  next();
}

router.use(checkDatabase);

router.get('/', async (req, res, next) => {
  try {
    const recipes = await Recipe.find().sort({ createdAt: -1 });
    res.json(recipes);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid recipe ID.' });
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found.' });
    res.json(recipe);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const payload = pickPayload(req.body);
    const errors = validatePayload(payload);
    if (errors.length) return res.status(400).json({ message: errors[0], errors });
    const recipe = await Recipe.create({ ...payload, name: payload.name.trim(), cookingTime: Number(payload.cookingTime) });
    res.status(201).json(recipe);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid recipe ID.' });
    const payload = pickPayload(req.body);
    const errors = validatePayload(payload);
    if (errors.length) return res.status(400).json({ message: errors[0], errors });
    const recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      { ...payload, name: payload.name.trim(), cookingTime: Number(payload.cookingTime) },
      { new: true, runValidators: true },
    );
    if (!recipe) return res.status(404).json({ message: 'Recipe not found.' });
    res.json(recipe);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid recipe ID.' });
    const recipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found.' });
    res.json({ message: 'Recipe deleted.' });
  } catch (error) {
    next(error);
  }
});

export default router;