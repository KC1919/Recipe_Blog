const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
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
        required: true
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
    },
    saves: {
        type: Number
    }
});

recipeSchema.index({
    name: 'text',
    steps: 'text'
});

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exposrts = recipeSchema;