import mongoose from 'mongoose';

export const CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert'];

const recipeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Recipe name is required.'],
      trim: true,
      maxlength: [100, 'Recipe name must be 100 characters or fewer.'],
    },
    category: {
      type: String,
      required: [true, 'Choose a category.'],
      enum: CATEGORIES,
    },
    ingredients: {
      type: [String],
      required: [true, 'Add at least one ingredient.'],
      validate: {
        validator: (items) => items.length > 0 && items.every((item) => item.trim()),
        message: 'Add at least one non-empty ingredient.',
      },
    },
    steps: {
      type: [String],
      required: [true, 'Add at least one preparation step.'],
      validate: {
        validator: (items) => items.length > 0 && items.every((item) => item.trim()),
        message: 'Add at least one non-empty preparation step.',
      },
    },
    cookingTime: {
      type: Number,
      required: [true, 'Cooking time is required.'],
      min: [1, 'Cooking time must be at least one minute.'],
      validate: {
        validator: Number.isInteger,
        message: 'Cooking time must be a whole number of minutes.',
      },
    },
  },
  { timestamps: true },
);

export default mongoose.model('Recipe', recipeSchema);