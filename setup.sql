-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table for Recipes
CREATE TABLE IF NOT EXISTS recipes (
  id TEXT PRIMARY KEY, -- Using the provided IDs like "com-001"
  name TEXT NOT NULL,
  category TEXT,
  sub_category TEXT,
  steps TEXT[] NOT NULL,
  cooking_time INTEGER,
  difficulty TEXT,
  servings INTEGER,
  region TEXT,
  calories INTEGER,
  tips TEXT,
  image_url TEXT,
  description TEXT,
  is_personal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for personal recipes
CREATE INDEX IF NOT EXISTS idx_recipes_is_personal ON recipes(is_personal);

-- Table for unique Ingredients
CREATE TABLE IF NOT EXISTS ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL
);

-- Junction table for Recipe-Ingredients (Mapping for matching logic)
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  recipe_id TEXT REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
  is_main BOOLEAN DEFAULT TRUE,
  amount TEXT,
  PRIMARY KEY (recipe_id, ingredient_id)
);

-- Table for Tags
CREATE TABLE IF NOT EXISTS recipe_tags (
  recipe_id TEXT REFERENCES recipes(id) ON DELETE CASCADE,
  tag TEXT,
  PRIMARY KEY (recipe_id, tag)
);

-- Index for searching recipes by name or ingredients
CREATE INDEX IF NOT EXISTS idx_recipes_name ON recipes USING GIN (to_tsvector('simple', name));
CREATE INDEX IF NOT EXISTS idx_ingredients_name ON ingredients(name);
