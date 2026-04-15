-- Diagnostic Query: Find recipes without associated ingredients
-- This SQL query will help identify if there are other recipes missing ingredients
SELECT  
    r.id,
    r.name,
    r.steps,
    COUNT(ri.ingredient_id) as ingredient_count
FROM 
    recipes r 
LEFT JOIN 
    recipe_ingredients ri ON r.id = ri.recipe_id
GROUP BY 
    r.id, r.name, r.steps
HAVING 
    COUNT(ri.ingredient_id) = 0
ORDER BY 
    r.created_at DESC
LIMIT 20;
