import fs from "fs/promises";
import path from "path";

const RECIPES_FILE = path.join(process.cwd(), "recipes.json");

// Sanitize input
function sanitize(str) {
  if (typeof str !== "string") return str;
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

function sanitizeRecipe(recipe) {
  const out = {
    title: sanitize(recipe.title),
    ingredients: recipe.ingredients.map(sanitize),
    steps: recipe.steps.map(sanitize),
    prepTime: sanitize(recipe.prepTime),
  };
  if (recipe.category) out.category = sanitize(recipe.category);
  if (recipe.difficulty) out.difficulty = sanitize(recipe.difficulty);
  if (recipe.servings) out.servings = sanitize(recipe.servings);
  return out;
}

export default async function handler(req, res) {
  try {
    // GET ALL RECIPES
    if (req.method === "GET") {
      const data = await fs.readFile(RECIPES_FILE, "utf8");
      return res.status(200).json(JSON.parse(data));
    }

    // ADD NEW RECIPE
    if (req.method === "POST") {
      const { title, ingredients, steps, prepTime } = req.body;

      if (!title || !ingredients || !steps || !prepTime) {
        return res.status(400).json({
          error:
            "Missing required fields: title, ingredients, steps, and prepTime",
        });
      }

      const data = await fs.readFile(RECIPES_FILE, "utf8");
      const recipes = JSON.parse(data);

      // Block duplicate titles
      if (recipes.some((r) => r.title.toLowerCase() === title.toLowerCase()))
        return res.status(409).json({ error: "Recipe already exists" });

      const newRecipe = sanitizeRecipe(req.body);
      recipes.push(newRecipe);

      await fs.writeFile(
        RECIPES_FILE,
        JSON.stringify(recipes, null, 2),
        "utf8"
      );

      return res.status(201).json({
        message: "Recipe added successfully",
        recipe: newRecipe,
      });
    }

    return res.status(405).json({ error: "Method Not Allowed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
