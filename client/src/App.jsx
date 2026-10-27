import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  ChefHat,
  Clock3,
  ChevronRight,
  Edit3,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';

const categories = ['All recipes', 'Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert'];
const blankRecipe = { name: '', category: '', ingredients: '', steps: '', cookingTime: '' };
const categoryPhotos = {
  Breakfast: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=900&q=85',
  Lunch: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85',
  Dinner: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=85',
  Snack: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=85',
  Dessert: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=85',
};
const heroPhoto = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1400&q=90';
const apiBaseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
const useBrowserStorage = window.location.hostname.endsWith('github.io');
const heroSlides = [
  {
    eyebrow: 'A LITTLE HEAT, A LOT OF HEART',
    title: 'Bring the',
    highlight: 'good stuff home.',
    description: 'Keep the dishes you love close, ready for your next kitchen adventure.',
    photo: heroPhoto,
    imageLabel: 'A flame-grilled burger with fresh toppings',
  },
  {
    eyebrow: 'MADE FOR SLOW MORNINGS',
    title: 'Make room for',
    highlight: 'one more bite.',
    description: 'From first coffee to last crumbs, save the recipes worth repeating.',
    photo: categoryPhotos.Breakfast,
    imageLabel: 'A breakfast spread with toast and eggs',
  },
  {
    eyebrow: 'THE TABLE IS YOURS',
    title: 'Pass around',
    highlight: 'something lovely.',
    description: 'Collect weeknight favorites, family classics, and happy accidents.',
    photo: categoryPhotos.Dinner,
    imageLabel: 'A colorful bowl of fresh vegetables and grains',
  },
];

function toForm(recipe) {
  return {
    name: recipe.name,
    category: recipe.category,
    ingredients: recipe.ingredients.join('\n'),
    steps: recipe.steps.join('\n'),
    cookingTime: String(recipe.cookingTime),
  };
}

function toPayload(form) {
  return {
    name: form.name.trim(),
    category: form.category,
    ingredients: form.ingredients.split('\n').map((item) => item.trim()).filter(Boolean),
    steps: form.steps.split('\n').map((step) => step.trim()).filter(Boolean),
    cookingTime: Number(form.cookingTime),
  };
}

function readBrowserRecipes() {
  try {
    const saved = JSON.parse(window.localStorage.getItem('recipe-book-recipes') || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function localStorageRequest(path, options) {
  const method = options.method || 'GET';
  const byId = path.match(/^\/api\/recipes\/([^/]+)$/);
  const recipes = readBrowserRecipes();
  const body = options.body ? JSON.parse(options.body) : null;

  if (path === '/api/recipes' && method === 'GET') {
    return recipes.sort((first, second) => second.createdAt.localeCompare(first.createdAt));
  }

  if (path === '/api/recipes' && method === 'POST') {
    const now = new Date().toISOString();
    const recipe = { ...body, _id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    window.localStorage.setItem('recipe-book-recipes', JSON.stringify([recipe, ...recipes]));
    return recipe;
  }

  if (!byId) throw new Error('Recipe not found.');
  const recipeIndex = recipes.findIndex((recipe) => recipe._id === byId[1]);
  if (recipeIndex < 0) throw new Error('Recipe not found.');
  const recipe = recipes[recipeIndex];

  if (method === 'GET') return recipe;
  if (method === 'PUT') {
    const updated = { ...recipe, ...body, updatedAt: new Date().toISOString() };
    recipes[recipeIndex] = updated;
    window.localStorage.setItem('recipe-book-recipes', JSON.stringify(recipes));
    return updated;
  }
  if (method === 'DELETE') {
    recipes.splice(recipeIndex, 1);
    window.localStorage.setItem('recipe-book-recipes', JSON.stringify(recipes));
    return { message: 'Recipe deleted.' };
  }

  throw new Error('Unsupported recipe operation.');
}

async function request(path, options = {}) {
  if (useBrowserStorage) return localStorageRequest(path, options);
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error('The recipe API returned a non-JSON response. Check that the Express API is deployed and VITE_API_URL points to it.');
  }
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'The request could not be completed.');
  return data;
}

function RecipeForm({ recipe, onClose, onSaved, notify }) {
  const [form, setForm] = useState(recipe ? toForm(recipe) : blankRecipe);
  const [saving, setSaving] = useState(false);
  const editing = Boolean(recipe);

  function update(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    const payload = toPayload(form);
    if (!payload.name || !payload.category || !payload.ingredients.length || !payload.steps.length || !Number.isInteger(payload.cookingTime) || payload.cookingTime < 1) {
      notify('Complete every field with valid values before saving.', 'error');
      return;
    }

    setSaving(true);
    try {
      await request(editing ? `/api/recipes/${recipe._id}` : '/api/recipes', {
        method: editing ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      });
      notify(editing ? 'Recipe updated.' : 'Recipe added to your book.', 'success');
      await onSaved();
      onClose();
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={editing ? 'Edit recipe' : 'Add a recipe'} onClose={onClose}>
      <form className="recipe-form" onSubmit={submit}>
        <label>
          Recipe name
          <input autoFocus maxLength="100" name="name" onChange={update} placeholder="e.g. Sunday lemon pancakes" required value={form.name} />
        </label>
        <div className="form-row">
          <label>
            Category
            <select name="category" onChange={update} required value={form.category}>
              <option value="" disabled>Choose one</option>
              {categories.slice(1).map((category) => <option key={category}>{category}</option>)}
            </select>
          </label>
          <label>
            Cooking time
            <span className="input-with-unit">
              <input min="1" name="cookingTime" onChange={update} placeholder="30" required type="number" value={form.cookingTime} />
              <span>min</span>
            </span>
          </label>
        </div>
        <label>
          Ingredients
          <textarea name="ingredients" onChange={update} placeholder={'2 cups flour\n1 lemon, zested\n...'} required rows="4" value={form.ingredients} />
          <span className="field-hint">Put each ingredient on a new line.</span>
        </label>
        <label>
          Preparation steps
          <textarea name="steps" onChange={update} placeholder={'Whisk the dry ingredients together.\nFold in the lemon zest.\n...'} required rows="5" value={form.steps} />
          <span className="field-hint">Put each step on a new line.</span>
        </label>
        <div className="form-actions">
          <button className="button button-quiet" onClick={onClose} type="button">Cancel</button>
          <button className="button button-primary" disabled={saving} type="submit">{saving ? 'Saving...' : editing ? 'Save changes' : 'Add to my book'}</button>
        </div>
      </form>
    </Modal>
  );
}

function Modal({ title, onClose, children, wide = false }) {
  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section aria-labelledby="modal-title" aria-modal="true" className={`modal${wide ? ' modal-wide' : ''}`} role="dialog">
        <div className="modal-heading">
          <h2 id="modal-title">{title}</h2>
          <button aria-label="Close dialog" className="icon-button" onClick={onClose} type="button"><X size={19} /></button>
        </div>
        {children}
      </section>
    </div>
  );
}

function RecipeDetails({ recipe, onClose, onEdit, onDelete }) {
  return (
    <Modal title="From your recipe book" onClose={onClose} wide>
      <div className="detail-topline">
        <span className={`category-tag category-${recipe.category.toLowerCase()}`}>{recipe.category}</span>
        <span className="detail-time"><Clock3 size={15} /> {recipe.cookingTime} min</span>
      </div>
      <h3 className="detail-title">{recipe.name}</h3>
      <div className="detail-columns">
        <section>
          <h4>Ingredients <span>{recipe.ingredients.length}</span></h4>
          <ul className="ingredient-list">
            {recipe.ingredients.map((ingredient, index) => <li key={`${ingredient}-${index}`}>{ingredient}</li>)}
          </ul>
        </section>
        <section>
          <h4>Preparation</h4>
          <ol className="step-list">
            {recipe.steps.map((step, index) => <li key={`${step}-${index}`}><span>{String(index + 1).padStart(2, '0')}</span>{step}</li>)}
          </ol>
        </section>
      </div>
      <div className="form-actions detail-actions">
        <button className="button button-danger-quiet" onClick={() => onDelete(recipe)} type="button"><Trash2 size={16} /> Delete</button>
        <button className="button button-primary" onClick={() => onEdit(recipe)} type="button"><Edit3 size={16} /> Edit recipe</button>
      </div>
    </Modal>
  );
}

export default function App() {
  const [recipes, setRecipes] = useState([]);
  const [category, setCategory] = useState('All recipes');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [activeSlide, setActiveSlide] = useState(0);

  async function loadRecipes() {
    try {
      const data = await request('/api/recipes');
      setRecipes(data);
      setLoadError('');
    } catch (error) {
      setLoadError(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadRecipes(); }, []);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 5600);
    return () => window.clearInterval(interval);
  }, []);
  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(null), 4200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const visibleRecipes = useMemo(() => recipes.filter((recipe) => {
    const matchesCategory = category === 'All recipes' || recipe.category === category;
    const matchesSearch = recipe.name.toLowerCase().includes(search.trim().toLowerCase());
    return matchesCategory && matchesSearch;
  }), [category, recipes, search]);

  function notify(message, type = 'success') {
    setToast({ message, type });
  }

  function openEdit(recipe) {
    setModal({ type: 'edit', recipe });
  }

  async function deleteRecipe(recipe) {
    if (!window.confirm(`Delete “${recipe.name}” from your recipe book? This cannot be undone.`)) return;
    try {
      await request(`/api/recipes/${recipe._id}`, { method: 'DELETE' });
      setModal(null);
      notify('Recipe deleted.', 'success');
      await loadRecipes();
    } catch (error) {
      notify(error.message, 'error');
    }
  }

  const categoryCounts = useMemo(() => recipes.reduce((counts, recipe) => {
    counts[recipe.category] = (counts[recipe.category] || 0) + 1;
    return counts;
  }, {}), [recipes]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <a aria-label="Recipe Book home" className="brand" href="#top">
          <span className="brand-mark"><ChefHat size={20} strokeWidth={2.2} /></span>
          <span>the recipe <strong>book</strong></span>
        </a>
        <div className="topbar-note"><span className="status-dot" /> {useBrowserStorage ? 'SAVED IN THIS BROWSER' : 'YOUR PERSONAL FOOD COLLECTION'}</div>
        <button className="button button-primary header-add" onClick={() => setModal({ type: 'new' })} type="button"><Plus size={17} /> Add recipe</button>
      </header>

      <main id="top">
        <section aria-label="Featured recipe inspiration" className="intro">
          <div aria-label={heroSlides[activeSlide].imageLabel} className="intro-visual" key={activeSlide} role="img" style={{ backgroundImage: `url(${heroSlides[activeSlide].photo})` }} />
          <div className="intro-copy" key={`copy-${activeSlide}`}>
            <p className="eyebrow">{heroSlides[activeSlide].eyebrow}</p>
            <h1>{heroSlides[activeSlide].title}<br /><em>{heroSlides[activeSlide].highlight}</em></h1>
            <p className="intro-description">{heroSlides[activeSlide].description}</p>
            <div className="intro-actions">
              <button className="button intro-cta" onClick={() => setModal({ type: 'new' })} type="button"><Plus size={16} /> Add a recipe</button>
              <div aria-label="Featured recipe slides" className="slide-controls">
                {heroSlides.map((slide, index) => (
                  <button aria-label={`Show slide ${index + 1}: ${slide.eyebrow}`} aria-pressed={activeSlide === index} className={activeSlide === index ? 'slide-dot active' : 'slide-dot'} key={slide.eyebrow} onClick={() => setActiveSlide(index)} type="button" />
                ))}
              </div>
              <span className="slide-count">0{activeSlide + 1} <span>/ 0{heroSlides.length}</span></span>
            </div>
          </div>
          <div aria-hidden="true" className="hero-image-caption"><ChefHat size={14} /> FROM THE RECIPE BOOK</div>
          <button aria-label="Next featured recipe" className="hero-next-mark" onClick={() => setActiveSlide((activeSlide + 1) % heroSlides.length)} type="button"><ChevronRight size={22} /></button>
        </section>

        <section className="collection" aria-label="Recipe collection">
          <div className="collection-heading">
            <div>
              <p className="eyebrow">SAVED FOR LATER</p>
              <h2>Popular in your kitchen <span>{recipes.length.toString().padStart(2, '0')}</span></h2>
            </div>
            <label className="search-box">
              <Search size={17} aria-hidden="true" />
              <input aria-label="Search recipes" onChange={(event) => setSearch(event.target.value)} placeholder="Find a recipe..." value={search} />
              {search && <button aria-label="Clear search" onClick={() => setSearch('')} type="button"><X size={14} /></button>}
            </label>
          </div>

          <nav aria-label="Filter by category" className="category-tabs">
            {categories.map((item) => (
              <button aria-pressed={category === item} className={category === item ? 'category-tab active' : 'category-tab'} key={item} onClick={() => setCategory(item)} type="button">
                {item}<span>{item === 'All recipes' ? recipes.length : categoryCounts[item] || 0}</span>
              </button>
            ))}
          </nav>

          {loadError && (
            <div className="error-banner" role="alert">
              <div><strong>We couldn’t reach your recipe book.</strong><span>{loadError}</span></div>
              <button className="button button-quiet" onClick={loadRecipes} type="button">Try again</button>
            </div>
          )}

          {loading ? (
            <div className="loading-state"><span className="loading-spinner" /> Loading your recipes...</div>
          ) : visibleRecipes.length ? (
            <div className="recipe-grid">
              {visibleRecipes.map((recipe, index) => (
                <article className="recipe-card" key={recipe._id} style={{ '--card-index': index }}>
                  <button className="recipe-open" onClick={() => setModal({ type: 'details', recipe })} type="button">
                    <span aria-hidden="true" className="recipe-cover" style={{ backgroundImage: `url(${categoryPhotos[recipe.category] || categoryPhotos.Dinner})` }} />
                    <span className={`category-tag category-${recipe.category.toLowerCase()}`}>{recipe.category}</span>
                    <span className="recipe-name">{recipe.name}</span>
                    <span className="recipe-meta"><Clock3 size={15} /> {recipe.cookingTime} min <span className="meta-divider" /> {recipe.ingredients.length} ingredients</span>
                    <span className="card-arrow" aria-hidden="true">↗</span>
                  </button>
                  <div className="card-actions">
                    <button aria-label={`Edit ${recipe.name}`} className="icon-button" onClick={() => openEdit(recipe)} title="Edit recipe" type="button"><Edit3 size={16} /></button>
                    <button aria-label={`Delete ${recipe.name}`} className="icon-button delete-icon" onClick={() => deleteRecipe(recipe)} title="Delete recipe" type="button"><Trash2 size={16} /></button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-illustration"><BookOpen size={28} /></span>
              <h3>{recipes.length ? 'Nothing on this menu yet.' : 'What are you craving?'}</h3>
              <p>{recipes.length ? 'Try another category or search term.' : 'Save your first favorite and keep the good food close.'}</p>
              {!recipes.length && <button className="button button-primary" onClick={() => setModal({ type: 'new' })} type="button"><Plus size={17} /> Add your first recipe</button>}
            </div>
          )}
        </section>
      </main>

      <footer className="footer"><span>GOOD FOOD, GOOD COMPANY.</span><span>{recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'} saved</span></footer>

      {modal?.type === 'new' && <RecipeForm onClose={() => setModal(null)} onSaved={loadRecipes} notify={notify} />}
      {modal?.type === 'edit' && <RecipeForm key={modal.recipe._id} onClose={() => setModal(null)} onSaved={loadRecipes} notify={notify} recipe={modal.recipe} />}
      {modal?.type === 'details' && <RecipeDetails onClose={() => setModal(null)} onDelete={deleteRecipe} onEdit={openEdit} recipe={modal.recipe} />}
      {toast && <div className={`toast toast-${toast.type}`} role="status">{toast.message}<button aria-label="Dismiss message" onClick={() => setToast(null)} type="button"><X size={15} /></button></div>}
    </div>
  );
}