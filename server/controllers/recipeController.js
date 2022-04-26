const Category = require('../models/Category');
const Recipe = require('../models/Recipe');

//get homepage
const homepage = async (req, res) => {

    try {
        const limitNumber = 5;
        const categories = await Category.find({}).limit(limitNumber);
        res.render('index', {
            'title': 'Recipe Blogs - Home',
            'categories': categories,
        });
    } catch (error) {
        res.status(500).send({
            message: error.message || 'Error occurred'
        });
    }

}

//Get all categories
const categories = async (req, res) => {
    try {
        const categories = await Category.find({}).limit(20);
        res.render('categories', {
            'categories': categories
        });
    } catch (error) {
        console.log("Error: ", error);
    }
}

const getPublishRecipe = async (req, res) => {
    res.render('publish');
}

const postPublishRecipe = async (req, res) => {
    console.log("hello");
}

const exploreRecipe = async (req, res) => {
    try {
        console.log(req.params.id);
        const recipe = await Recipe.findById(req.params.id);
        if (recipe !== null) {
            res.render('recipe', {
                'title': 'Recipi Blog - Recipi',
                'recipe': recipe
            });
        }
    } catch (error) {
        console.log("Recipe not found, server error");
    }
}

const exploreCategory = async (req, res) => {
    try {
        console.log(req.params.id);
        const recipes = await Recipe.find({
            'category': req.params.id
        });
        if (recipes !== null) {
            res.render('categories', {
                'title': 'Recipi Blog - Recipi',
                'recipes': recipes
            });
        }
    } catch (error) {
        console.log("Recipe not found, server error");
    }
}

const searchRecipe = async (req, res) => {
    try {
        const searchTerm = req.body.searchTerm;

        const recipes = await Recipe.find({
            $text: {
                $search: searchTerm,
                $diacriticSensitive: true
            }
        })
        res.render('search', {
            title: 'Food Blog - Search',
            'recipes': recipes
        });
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    homepage,
    categories,
    getPublishRecipe,
    postPublishRecipe,
    exploreRecipe,
    exploreCategory,
    searchRecipe
};