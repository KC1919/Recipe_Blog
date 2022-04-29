const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    publisher: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Thai', 'Indian', 'American', 'Chinese', 'Mexican', 'Continental', 'South Indian', 'North Indian', 'Italian']
    },
    type: {
        type: String,
        required: true,
        enum: ['Dinner', 'Breakfast', 'Lunch', 'Snack', 'Beverage', 'Fast Food', 'Dessert']
    },

    diet: {
        type: String,
        required: true,
        enum: ['Veg', 'Non Veg']
    },

    ingredients: {
        type: Array,
        required: true
    },
    steps: {
        type: String,
        required: true
    },
    likes: {
        type: Number,
        default: 0
    },
    saves: {
        type: Number,
        default: 0
    }
});

recipeSchema.index({
    name: 'text',
    steps: 'text',
    category: 'text',
    type: 'text',
    diet: 'text'
});

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;