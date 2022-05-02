const Category = require('../models/Category');
const Recipe = require('../models/Recipe');
const path = require('path');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
// const ObjectId = require('mongodb').ObjectId;
const mongoose = require('mongoose');

//fetching and rendering the homepage
exports.homepage = async (req, res) => {

    try {
        const limitNumber = 5;
        const categories = await Category.find({}).limit(limitNumber);

        //getting the top 5 most recent recipes
        const latestRecipes = await Recipe.find({}).sort({
            _id: -1
        }).limit(5);

        //getting the top 5 most liked recipes
        const popularRecipes = await Recipe.find({}).sort({
            'likes': -1
        }).limit(5);

        let loggedInStatus = false;
        let myRecipes = null;
        let likedRecipes = null;
        let savedRecipes = null

        //if the user is logged in
        if (typeof req.cookies['secret'] !== 'undefined') {

            const token = req.cookies['secret'];
            const payload = jwt.verify(token, process.env.SECRET_KEY);
            if (payload !== null) {
                req.user = payload.userId;
            }
            loggedInStatus = true;

            //getting the recipes published by the user
            myRecipes = await Recipe.find({
                'author': req.user
            }).sort({
                _id: -1
            }).lean();

            //getting all the recipe ids liked by the user
            let likedRecipesId = await User.findById(req.user, {
                liked: 1,
                _id: 0
            }).lean();

            //getting the array of liked recipe ids from the object
            likedRecipesId = likedRecipesId !== null ? likedRecipesId['liked'] : null;

            //fetching all the recipes with the ids present in the likedRecipesId array
            likedRecipes = await Recipe.find({
                '_id': {
                    $in: likedRecipesId
                }
            });

            //getting the array of saved recipe ids from the object
            let savedRecipesId = await User.findById(req.user, {
                saved: 1,
                _id: 0
            }).lean();

            //getting the array of saved recipe ids from the object
            savedRecipesId = savedRecipesId !== null ? savedRecipesId['saved'] : null;

            //fetching all the recipes with the ids present in the savedRecipesId array
            savedRecipes = await Recipe.find({
                '_id': {
                    $in: savedRecipesId
                }
            });
        }

        //rendering the homepage, the user information
        res.render('index', {
            'title': 'Recipe Blogs - Home',
            'categories': categories,
            'latestRecipes': latestRecipes,
            'loggedInStatus': loggedInStatus,
            'popularRecipes': popularRecipes,
            'myRecipes': myRecipes,
            'likedRecipes': likedRecipes,
            'savedRecipes': savedRecipes
        });

    } catch (error) {
        console.log("Failed to load homepage, internal server error");
        res.status(500).send({
            message: error.message || 'Error occurred'
        });
    }

}

//Get all categories
exports.categories = async (req, res) => {
    try {
        const categories = await Category.find({}).limit(20);
        res.render('categories', {
            'categories': categories
        });
    } catch (error) {
        console.log("Error: ", error);
    }
}

//rendering the recipe publish form
exports.getPublishRecipe = async (req, res) => {
    res.render('publish');
}

//function to process the publish recipe request
exports.postPublishRecipe = async (req, res) => {
    try {

        let imageUploadFile;
        let imageUploadPath;
        let newImageName;

        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send('No files were uploaded.');
        }

        // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
        imageUploadFile = req.files.image;

        //naming the image file
        newImageName = Date.now() + ' ' + imageUploadFile.name;

        //setting the image path(where to be saved)
        imageUploadPath = path.resolve('./') + '/public/uploads/' + newImageName;

        //finally writing the image file in the server
        imageUploadFile.mv(imageUploadPath, (err) => {
            if (err) {
                console.log(err);
            }
        });

        //getting the user info of the logged in user
        const user = await User.findById(req.user);

        let publisher = '';

        //setting the publisher to the user's name
        if (user !== null) {
            publisher = user.name;
        }

        //getting the list of ingredients name
        let ingredientNames = req.body.ingredientName;

        //getting the list of ingredients quantity
        let ingredientQuantities = req.body.quantity;

        //getting the list of ingredients quantity units
        let ingredientUnits = req.body.units;

        //array to store the object of all the ingredients info
        let ingredientsArr = [];

        // console.log(typeof req.body.ingredientName);

        //if the ingredientName is of object type. that means there are more than 1 ingredients
        if (typeof req.body.ingredientName == 'object') {

            //we loop through the names, wuantity and units array of the ingredients
            for (let i = 0; i < ingredientNames.length; i++) {

                //make an object for each ingredient, consisting of the name, wuantity and unit 
                // of the quantity of the ingredient
                let ingredientData = {
                    'name': ingredientNames[i],
                    'quantity': ingredientQuantities[i],
                    'unit': ingredientUnits[i]
                }

                //adding ingredient object ingredients array
                ingredientsArr.push(ingredientData);
            }
        } else { //if there is only 1 ingredient
            ingredientsArr.push({
                'name': ingredientNames,
                'quantity': ingredientQuantities,
                'unit': ingredientUnits
            })
        }

        // creating and saving the recipe in the database
        const newRecipe = {
            'author': req.user,
            'publisher': publisher,
            'name': req.body.name,
            'image': newImageName,
            'ingredients': ingredientsArr,
            'steps': req.body.steps,
            'category': req.body.category,
            'type': req.body.type,
            'diet': req.body.diet
        };

        const recipe = await Recipe.create(newRecipe);

        if (recipe) {
            console.log("Recipe saved successfully!");
            res.status(201).json({
                message: "Recipe published successfully!",
                status: 'success'
            });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Failed to publish recipe, server error",
            status: 'failure',
            error: error
        });
    }
}

//function to render the details of a recipe
exports.exploreRecipe = async (req, res) => {
    try {

        //getting the details of the recipe by recipe id
        const recipe = await Recipe.findById(req.params.id);
        if (recipe !== null) {

            //rendering the recipe details page with all the details of the recipe
            res.render('recipe', {
                'title': 'Recipe Blog - Recipe',
                'recipe': recipe
            });
        }
    } catch (error) {
        console.log("Recipe not found, server error");
    }
}

exports.exploreCategory = async (req, res) => {
    try {

        //getting all the recipes of a particular category
        const recipes = await Recipe.find({
            'category': req.params.id
        });

        //rendering all the recipes for the queried category
        if (recipes !== null) {
            res.render('recipes', {
                'title': 'Recipe Blog - Recipe',
                'recipes': recipes
            });
        }
    } catch (error) {
        console.log("Recipe not found, server error");
    }
}

//function to process search query
exports.searchRecipe = async (req, res) => {
    try {
        //getting the search term
        const searchTerm = req.body.searchTerm;

        //fetching all the recipes , if it contains  the search term
        const recipes = await Recipe.find({
            $text: {
                $search: searchTerm,
                $diacriticSensitive: true
            }
        });

        //rendering all the recipes found with the searched term, to the user
        res.render('search', {
            title: 'Food Blog - Search',
            'recipes': recipes
        });
    } catch (error) {
        console.log(error);
    }
}

//getting the 20 latest recipes
exports.latestRecipes = async (req, res) => {
    try {
        //getting the top 20 recipes sorted in descending order of their id, means the recipes that 
        // was posted last would be the latest
        const recipes = await Recipe.find({}).sort({
            '_id': -1
        }).limit(20);

        res.render('recipes', {
            'recipes': recipes
        });
    } catch (error) {
        console.log("Error occured ", error);
        res.status(500).json({
            message: "Error fetching latest recipes, server error",
            status: 'failure'
        });
    }
}

//function to render 20 popular recipes
exports.popularRecipes = async (req, res) => {
    try {

        //getting the top 20 recipes sorted in descending order of their likes, means the recipes that 
        // has maximum likes would be at the top
        const recipes = await Recipe.find({}).sort({
            'likes': -1
        }).limit(20);

        res.render('recipes', {
            'recipes': recipes
        });
    } catch (error) {
        console.log("Error occured ", error);
        res.status(500).json({
            message: "Error fetching popular recipes, server error",
            status: 'failure'
        });
    }
}

exports.likedRecipes = async (req, res) => {
    try {
        //getting all the recipe ids liked by the user
        let likedRecipesId = await User.findById(req.user, {
            liked: 1,
            _id: 0
        }).lean();

        //getting the array of liked recipe ids from the object
        likedRecipesId = likedRecipesId['liked'];

        //fetching all the recipes with the ids present in the likedRecipesId array
        let likedRecipes = await Recipe.find({
            '_id': {
                $in: likedRecipesId
            }
        });

        res.render('liked-recipes', {
            'likedRecipes': likedRecipes
        })
    } catch (error) {
        console.log("Error occured ", error);
        res.status(500).json({
            message: "Error fetching liked recipes, server error",
            status: 'failure'
        });
    }
}

exports.myRecipes = async (req, res) => {
    try {

        //fetching all the recipes posted by the user from the database
        const recipes = await Recipe.find({
            'author': req.user
        });

        //if there are any recipes we send them to the frontend
        if (recipes !== null && recipes.length > 0) {
            res.render('myrecipes', {
                'myRecipes': recipes
            });
        } else { //else we send an empty array
            res.render('myrecipes', {
                'myRecipes': []
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Recipes not found, server error',
            status: 'failure'
        });
    }
}

exports.savedRecipes = async (req, res) => {
    try {
        //getting all the recipe ids liked by the user
        let savedRecipesId = await User.findById(req.user, {
            saved: 1,
            _id: 0
        }).lean();

        //getting the array of liked recipe ids from the object
        savedRecipesId = savedRecipesId['saved'];

        //fetching all the recipes with the ids present in the likedRecipesId array
        let savedRecipes = await Recipe.find({
            '_id': {
                $in: savedRecipesId
            }
        });

        res.render('saved-recipes', {
            'savedRecipes': savedRecipes
        })
    } catch (error) {
        console.log("Error occured ", error);
        res.status(500).json({
            message: "Error fetching saved recipes, server error",
            status: 'failure'
        });
    }
}

exports.incrementLikes = async (req, res) => {
    try {

        //getting the recipe id whose likes is to be incremented
        let recipeId = req.body.recipeId;

        //converting the recipe id from string to ObjectId
        recipeId = mongoose.Types.ObjectId(recipeId);

        //checking if the recipe already exists in the list of user's liked recipes
        const userLikedRecipe = await User.findById(req.user, {
            'liked': {
                $elemMatch: {
                    $eq: recipeId
                }
            },
            '_id': 0
        });

        //if the recipe does not exists in the user's list of liked recipes
        if (userLikedRecipe.liked.length == 0) {

            //then we increment the likes on the recipe by 1
            const updateLike = await Recipe.findByIdAndUpdate(recipeId, {
                $inc: {
                    "likes": 1
                }
            })
            let updateUserLikedRecipes = null;

            //and add the recipe to the list of user's liked recipes
            updateUserLikedRecipes = await User.findByIdAndUpdate(req.user, {
                $push: {
                    liked: recipeId
                }
            });

            if (typeof updateLike !== 'undefined' && typeof updateUserLikedRecipes !== 'undefined') {
                console.log("Recipe added to the liked list of the user successfully");
                res.status(200).json({
                    message: "Likes updated successfully",
                    status: 'success'
                });
            }
        } else {
            console.log("Recipe already in the liked list");
            res.status(200).json({
                message: "Recipe already in the liked list",
                status: 'success'
            });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Failed to update likes",
            status: 'failure'
        });
    }
}

exports.decrementLikes = async (req, res) => {
    try {
        let recipeId = req.body.recipeId;

        //decrementing the likes on the recipe by 1 
        const updateLike = await Recipe.findByIdAndUpdate(recipeId, {
            $inc: {
                "likes": -1
            }
        })
        let updateUserLikedRecipes = null;

        recipeId = mongoose.Types.ObjectId(recipeId);

        //removeingg the recipe from the user's list of saved recipes
        updateUserLikedRecipes = await User.findByIdAndUpdate(req.user, {
            $pull: {
                liked: recipeId
            }
        });

        // console.log(updateLike);
        // console.log(updateUserLikedRecipes);

        if (typeof updateLike !== 'undefined' && typeof updateUserLikedRecipes !== 'undefined') {
            res.status(200).json({
                message: "Likes updated successfully",
                status: 'success'
            });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Failed to update likes",
            status: 'failure'
        });
    }
}

//function to handle save request
exports.saveRecipe = async (req, res) => {
    try {
        let recipeId = req.body.recipeId;

        let recipeObjectId = mongoose.Types.ObjectId(recipeId);

        //checking if the recipe is already present in the list of user's saved recipes
        const findRecipe = await User.findById(req.user, {
            'saved': {
                $elemMatch: {
                    $eq: recipeObjectId
                }
            },
            '_id': 0
        });

        //if the recipe is not present in the list of user's saved recipes
        if (findRecipe.saved.length === 0) {

            //then we add the recipe in the user's list of sved recipes
            const addRecipeUser = await User.findByIdAndUpdate(req.user, {
                $push: {
                    saved: recipeObjectId
                }
            });

            if (addRecipeUser !== null) {
                res.status(201).json({
                    message: "Recipe added to the saved list successfully!",
                    status: 'success'
                });
            }
        } else {
            console.log('Recipe already in the saved list');
            res.status(200).json({
                message: 'Recipe already present in the saved list',
                status: 'failure'
            })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Failed to save recipe",
            status: 'failure'
        });
    }
}

//function to handle unsave request
exports.unsaveRecipe = async (req, res) => {
    try {
        let recipeId = req.body.recipeId;

        let recipeObjectId = mongoose.Types.ObjectId(recipeId);

        //removing the recipe from the user's list of saved recipes
        const removeRecipeUser = await User.findByIdAndUpdate(req.user, {
            $pull: {
                saved: recipeObjectId
            }
        });

        if (removeRecipeUser !== null) {
            res.status(201).json({
                message: "Recipe added to the saved list successfully!",
                status: 'success'
            });
        }


    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Failed to unsave recipe",
            status: 'failure'
        });
    }
}

// exports.getEditRecipe = async (req, res) => {
//     try {
//         let recipeId = req.params.id;
//         // console.log(+recipeId);
//         const recipe = await Recipe.findById(recipeId);
//         console.log(recipe);
//         res.render('edit-recipe', {
//             'recipe': recipe
//         });
//     } catch (error) {
//         console.log("Recipe edit failed,server error", error);
//         res.status(500).json({
//             message: "Recipe edit failed,server error",
//             status: "failure"
//         });
//     }
// }