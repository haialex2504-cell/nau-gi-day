-- Fix Missing Ingredients for Recipes in Nau Gi Day PWA
-- This script connects recipes in the recipes table to their ingredients via recipe_ingredients table

-- First, add ingredients and get their UUIDs (ingredients table auto-generates UUIDs)
INSERT INTO ingredients (name) VALUES
  ('ức gà'),
  ('rau xà lách'),
  ('cà chua bi'),
  ('dưa chuột'),
  ('mè rang'),
  ('sốt mè'),
  ('chuối'),
  ('yến mạch'),
  ('trứng'),
  ('mật ong'),
  ('cùi bưởi'),
  ('đậu xanh'),
  ('nước cốt dừa')
ON CONFLICT (name) DO NOTHING;

-- Connect Salad ức gà sốt mè rang (healthy-p01) to its ingredients
-- Using upsert to connect the pre-existing recipe to the ingredients
WITH target_ingredients AS (
  SELECT id AS ingredient_id, name FROM ingredients 
  WHERE name IN ('ức gà', 'rau xà lách', 'cà chua bi', 'dưa chuột', 'mè rang', 'sốt mè')
),
target_recipe AS (
  SELECT 'healthy-p01' AS id
)
-- Insert connections with appropriate amounts and 'is_main' flags for main ingredients
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, is_main) 
SELECT 
  'healthy-p01' AS recipe_id,
  ti.ingredient_id,
  CASE 
    WHEN ti.name = 'ức gà' THEN '150g'
    WHEN ti.name = 'rau xà lách' THEN '1 nắm'
    WHEN ti.name = 'cà chua bi' THEN '10 quả'
    WHEN ti.name = 'dưa chuột' THEN '1/2 quả'
    WHEN ti.name = 'mè rang' THEN '1 muỗng canh'
    WHEN ti.name = 'sốt mè' THEN '2 muỗng canh'
  END AS amount,
  CASE 
    WHEN ti.name IN ('ức gà', 'rau xà lách', 'cà chua bi', 'dưa chuột', 'sốt mè') THEN true
    ELSE false
  END AS is_main
FROM target_ingredients ti
ON CONFLICT (recipe_id, ingredient_id) DO NOTHING;

-- Connect Pancake chuối yến mạch (break-p01) to its ingredients
WITH target_ingredients AS (
  SELECT id AS ingredient_id, name FROM ingredients 
  WHERE name IN ('chuối', 'yến mạch', 'trứng', 'mật ong')
),
target_recipe AS (
  SELECT 'break-p01' AS id
)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, is_main) 
SELECT 
  'break-p01' AS recipe_id,
  ti.ingredient_id,
  CASE 
    WHEN ti.name = 'chuối' THEN '2 quả'
    WHEN ti.name = 'yến mạch' THEN '50g'
    WHEN ti.name = 'trứng' THEN '1 quả'
    WHEN ti.name = 'mật ong' THEN '1 muỗng canh'
  END AS amount,
  CASE 
    WHEN ti.name IN ('chuối', 'yến mạch', 'trứng') THEN true
    ELSE false
  END AS is_main
FROM target_ingredients ti
ON CONFLICT (recipe_id, ingredient_id) DO NOTHING;

-- Connect Chè bưởi cốm dừa (snack-p01) to its ingredients  
WITH target_ingredients AS (
  SELECT id AS ingredient_id, name FROM ingredients 
  WHERE name IN ('cùi bưởi', 'đậu xanh', 'nước cốt dừa')
)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, is_main) 
SELECT 
  'snack-p01' AS recipe_id,
  ti.ingredient_id,
  CASE 
    WHEN ti.name = 'cùi bưởi' THEN '200g'
    WHEN ti.name = 'đậu xanh' THEN '100g'
    WHEN ti.name = 'nước cốt dừa' THEN '50ml'
  END AS amount,
  true AS is_main
FROM target_ingredients ti
ON CONFLICT (recipe_id, ingredient_id) DO NOTHING;

-- You can add more recipe-ingredient connections here as needed
