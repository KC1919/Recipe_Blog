const express = require('express');
const verifyUser = require('../middlewares/verify');
const router = express.Router();
const {
    homepage,
    categories,
    getPublishRecipe,
    postPublishRecipe,
    exploreRecipe,
    exploreCategory,
    searchRecipe,
} = require('../controllers/recipeController');
const { verify } = require('jsonwebtoken');

router.get('/', homepage);
router.get('/categories', categories);
router.get('/recipe/:id', exploreRecipe);
router.get('/categories/:id', exploreCategory);
router.get('/submit-recipe', verifyUser, getPublishRecipe);
router.post('/search',searchRecipe);
router.post('/submit-recipe',verifyUser, postPublishRecipe)

module.exports = router;