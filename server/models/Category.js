const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const categorySchema = new Schema({
    name: {
        type: String,
        required: true,
        enum: ['Thai', 'Indian', 'American', 'Chinese', 'Mexican', 'Continental', 'South Indian', 'North Indian', 'Italian']
    },
    image: {
        type: String,
        required: true
    },
})

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;