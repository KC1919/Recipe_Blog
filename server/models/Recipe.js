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
    },
    category: {
        type: String,
        required: true,
        enum: ['Thai', 'Indian', 'American', 'Chinese', 'Mexican', 'Continental', 'South Indian', 'North Indian', 'Italian']
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
    steps: 'text'
});

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;