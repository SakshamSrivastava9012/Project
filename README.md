# Recipe Platform

A web platform that allows users to browse, search, view details, and submit cooking recipes in a structured format. Built with HTML, CSS, JavaScript, and Node.js.

## Features

- 🏠 **Home Page**: Showcases featured recipes with quick navigation
- 🔍 **Recipe List & Search**: Browse all recipes with client-side search by name or ingredients
- 📖 **Recipe Details**: View complete recipe information with ingredients and cooking steps
- ➕ **Submit Recipe**: Add new recipes with form validation
- 💾 **JSON Persistence**: All recipes stored in `recipes.json` file

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript (Fetch API)
- **Backend**: Node.js with Express
- **Storage**: File-based JSON (`recipes.json`)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

## Project Structure

```
bca/
├── server.js              # Node.js server with API endpoints
├── recipes.json           # Recipe data storage
├── package.json           # Node.js dependencies
├── public/                # Static files
│   ├── index.html        # Home page
│   ├── recipes.html      # Recipe list & search page
│   ├── recipe-detail.html # Recipe detail page
│   ├── submit.html       # Submit recipe form
│   ├── css/
│   │   └── style.css     # Main stylesheet
│   └── js/
│       └── app.js        # Client-side JavaScript utilities
└── README.md             # This file
```

## API Endpoints

### GET /api/recipes
Returns all recipes from `recipes.json`

**Response:**
```json
[
  {
    "title": "Recipe Name",
    "ingredients": ["item1", "item2"],
    "steps": ["step1", "step2"],
    "prepTime": "15"
  }
]
```

### POST /api/recipes
Adds a new recipe to `recipes.json`

**Request Body:**
```json
{
  "title": "Recipe Name",
  "ingredients": ["item1", "item2"],
  "steps": ["step1", "step2"],
  "prepTime": "15"
}
```

**Response:**
- `201 Created`: Recipe added successfully
- `400 Bad Request`: Missing or invalid required fields
- `409 Conflict`: Recipe with same title already exists

## Usage

1. **Browse Recipes**: Visit the home page or click "Browse Recipes" to see all available recipes
2. **Search**: Use the search bar to filter recipes by name or ingredients
3. **View Details**: Click on any recipe card to see full details
4. **Submit Recipe**: Fill out the form on the "Submit Recipe" page with:
   - Recipe title (required)
   - Ingredients (one per line or comma-separated)
   - Cooking steps (one per line)
   - Prep time in minutes (required)

## Features Implemented

✅ Featured recipes on home page
✅ Recipe browsing and searching
✅ Client-side filtering by name and ingredients
✅ Recipe detail pages with structured format
✅ Form validation (client-side)
✅ API endpoints for GET and POST
✅ JSON file persistence
✅ Responsive design for mobile and desktop
✅ Clean, readable UI with consistent navigation
✅ Input sanitization for security
✅ Error handling and user feedback

## Requirements Met

- ✅ All core features from PRD
- ✅ Responsive layout
- ✅ Form validation
- ✅ JSON persistence
- ✅ API endpoints
- ✅ Clean typography and UI
- ✅ Security considerations (input sanitization, payload limits)

## Future Enhancements

- User accounts & authentication
- Recipe rating and commenting
- Favorites/bookmarking system
- Image upload support
- More filters (cuisine, diet tags, difficulty)
- Rate limiting

## License

ISC

