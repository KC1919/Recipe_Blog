const express = require('express');
const verifyUser = require('../middlewares/verify');
const router = express.Router();
const recipeController = require('../controllers/recipeController');

router.get('/', recipeController.homepage);
router.get('/categories', recipeController.categories);
router.get('/recipe/:id', recipeController.exploreRecipe);
router.get('/categories/:id', recipeController.exploreCategory);
router.get('/submit-recipe', verifyUser, recipeController.getPublishRecipe);
router.post('/search', recipeController.searchRecipe);
router.post('/submit-recipe', verifyUser, recipeController.postPublishRecipe);
router.get('/latest-recipes/', recipeController.latestRecipes);
router.get('/popular-recipes/', recipeController.popularRecipes);
router.get('/liked-recipes/', verifyUser, recipeController.likedRecipes);
router.get('/my-recipes/', verifyUser, recipeController.myRecipes);
router.post('/increment-likes', recipeController.incrementLikes);
router.post('/decrement-likes', recipeController.decrementLikes);

module.exports = router;