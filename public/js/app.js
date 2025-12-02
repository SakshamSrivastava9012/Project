// Utility function to escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Fetch all recipes from API
async function fetchRecipes() {
    try {
        const response = await fetch('/api/recipes');
        if (!response.ok) {
            throw new Error('Failed to fetch recipes');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching recipes:', error);
        throw error;
    }
}

// Submit a new recipe
async function submitRecipe(recipeData) {
    try {
        const response = await fetch('/api/recipes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(recipeData)
        });
        return response;
    } catch (error) {
        console.error('Error submitting recipe:', error);
        throw error;
    }
}

// LocalStorage utilities for favorites and ratings
const Storage = {
    getFavorites: () => {
        const favorites = localStorage.getItem('recipeFavorites');
        return favorites ? JSON.parse(favorites) : [];
    },
    
    saveFavorites: (favorites) => {
        localStorage.setItem('recipeFavorites', JSON.stringify(favorites));
    },
    
    toggleFavorite: (recipeTitle) => {
        const favorites = Storage.getFavorites();
        const index = favorites.indexOf(recipeTitle);
        if (index > -1) {
            favorites.splice(index, 1);
        } else {
            favorites.push(recipeTitle);
        }
        Storage.saveFavorites(favorites);
        return !(index > -1);
    },
    
    isFavorite: (recipeTitle) => {
        return Storage.getFavorites().includes(recipeTitle);
    },
    
    getRatings: () => {
        const ratings = localStorage.getItem('recipeRatings');
        return ratings ? JSON.parse(ratings) : {};
    },
    
    saveRatings: (ratings) => {
        localStorage.setItem('recipeRatings', JSON.stringify(ratings));
    },
    
    setRating: (recipeTitle, rating) => {
        const ratings = Storage.getRatings();
        ratings[recipeTitle] = rating;
        Storage.saveRatings(ratings);
    },
    
    getRating: (recipeTitle) => {
        const ratings = Storage.getRatings();
        return ratings[recipeTitle] || 0;
    },
    
    getRatingCount: (recipeTitle) => {
        const ratings = Storage.getRatings();
        return ratings[recipeTitle] ? 1 : 0; // Simple count for MVP
    }
};

// Get average rating for a recipe (for future use with multiple users)
function getAverageRating(recipeTitle) {
    const rating = Storage.getRating(recipeTitle);
    return rating || 0;
}

// Sort recipes
function sortRecipes(recipes, sortBy) {
    const sorted = [...recipes];
    
    switch(sortBy) {
        case 'name-asc':
            return sorted.sort((a, b) => a.title.localeCompare(b.title));
        case 'name-desc':
            return sorted.sort((a, b) => b.title.localeCompare(a.title));
        case 'time-asc':
            return sorted.sort((a, b) => Number(a.prepTime) - Number(b.prepTime));
        case 'time-desc':
            return sorted.sort((a, b) => Number(b.prepTime) - Number(a.prepTime));
        case 'rating-desc':
            return sorted.sort((a, b) => {
                const ratingA = getAverageRating(a.title);
                const ratingB = getAverageRating(b.title);
                return ratingB - ratingA;
            });
        default:
            return sorted;
    }
}

// Filter recipes
function filterRecipes(recipes, filters) {
    let filtered = [...recipes];
    
    // Filter by category
    if (filters.category && filters.category !== 'all') {
        filtered = filtered.filter(recipe => 
            (recipe.category || 'Uncategorized').toLowerCase() === filters.category.toLowerCase()
        );
    }
    
    // Filter by difficulty
    if (filters.difficulty && filters.difficulty !== 'all') {
        filtered = filtered.filter(recipe => 
            (recipe.difficulty || 'medium').toLowerCase() === filters.difficulty.toLowerCase()
        );
    }
    
    // Filter by prep time
    if (filters.maxTime) {
        filtered = filtered.filter(recipe => Number(recipe.prepTime) <= Number(filters.maxTime));
    }
    
    // Filter by favorites
    if (filters.favoritesOnly) {
        filtered = filtered.filter(recipe => Storage.isFavorite(recipe.title));
    }
    
    return filtered;
}

// Search recipes
function searchRecipes(recipes, searchTerm) {
    if (!searchTerm || !searchTerm.trim()) return recipes;
    
    const term = searchTerm.toLowerCase();
    return recipes.filter(recipe => {
        // Search in title
        if (recipe.title.toLowerCase().includes(term)) return true;
        
        // Search in ingredients
        if (recipe.ingredients.some(ing => ing.toLowerCase().includes(term))) return true;
        
        // Search in category
        if (recipe.category && recipe.category.toLowerCase().includes(term)) return true;
        
        return false;
    });
}

// Generate star rating HTML
function generateStars(rating, interactive = false, recipeTitle = '') {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let html = '<div class="star-rating">';
    
    for (let i = 0; i < fullStars; i++) {
        if (interactive) {
            html += `<span class="star filled" data-rating="${i + 1}" data-recipe="${recipeTitle}">★</span>`;
        } else {
            html += '<span class="star filled">★</span>';
        }
    }
    
    if (hasHalfStar) {
        html += '<span class="star filled">★</span>';
    }
    
    for (let i = 0; i < emptyStars; i++) {
        if (interactive) {
            html += `<span class="star" data-rating="${fullStars + (hasHalfStar ? 1 : 0) + i + 1}" data-recipe="${recipeTitle}">★</span>`;
        } else {
            html += '<span class="star">★</span>';
        }
    }
    
    html += '</div>';
    return html;
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease-out reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Print recipe
function printRecipe(recipe) {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>${recipe.title}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 2rem; }
                    h1 { color: #333; border-bottom: 3px solid #6366f1; padding-bottom: 1rem; }
                    h2 { color: #6366f1; margin-top: 2rem; }
                    ul, ol { line-height: 1.8; }
                    .meta { background: #f3f4f6; padding: 1rem; border-radius: 8px; margin: 1rem 0; }
                </style>
            </head>
            <body>
                <h1>${escapeHtml(recipe.title)}</h1>
                <div class="meta">
                    <strong>Prep Time:</strong> ${recipe.prepTime} minutes<br>
                    ${recipe.servings ? `<strong>Servings:</strong> ${recipe.servings}<br>` : ''}
                    ${recipe.difficulty ? `<strong>Difficulty:</strong> ${recipe.difficulty}<br>` : ''}
                    ${recipe.category ? `<strong>Category:</strong> ${recipe.category}` : ''}
                </div>
                <h2>Ingredients</h2>
                <ul>
                    ${recipe.ingredients.map(ing => `<li>${escapeHtml(ing)}</li>`).join('')}
                </ul>
                <h2>Instructions</h2>
                <ol>
                    ${recipe.steps.map(step => `<li>${escapeHtml(step)}</li>`).join('')}
                </ol>
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Share recipe
function shareRecipe(recipe) {
    if (navigator.share) {
        navigator.share({
            title: recipe.title,
            text: `Check out this recipe: ${recipe.title}`,
            url: window.location.href
        }).catch(err => console.log('Error sharing:', err));
    } else {
        // Fallback: copy to clipboard
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            showToast('Recipe link copied to clipboard!', 'success');
        });
    }
}

// Get all unique categories from recipes
function getCategories(recipes) {
    const categories = new Set();
    recipes.forEach(recipe => {
        if (recipe.category) {
            categories.add(recipe.category);
        }
    });
    return Array.from(categories).sort();
}

