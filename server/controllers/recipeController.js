const Category = require('../models/Category');
const Recipe = require('../models/Recipe');
const path = require('path');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
// const ObjectId = require('mongodb').ObjectId;
const mongoose = require('mongoose');

//get homepage
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

exports.getPublishRecipe = async (req, res) => {
    res.render('publish');
}

exports.postPublishRecipe = async (req, res) => {
    try {

        console.log(req.body);
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

        const user = await User.findById(req.user);

        let publisher = '';

        if (user !== null) {
            publisher = user.name;
        }

        let ingredientNames = req.body.ingredientName;
        let ingredientQuantities = req.body.quantity;
        let ingredientUnits = req.body.units;

        let ingredientsArr = [];

        console.log(typeof req.body.ingredientName);
        if (typeof req.body.ingredientName == 'object') {
            for (let i = 0; i < ingredientNames.length; i++) {
                let ingredientData = {
                    'name': ingredientNames[i],
                    'quantity': ingredientQuantities[i],
                    'unit': ingredientUnits[i]
                }

                ingredientsArr.push(ingredientData);
            }
        } else {
            ingredientsArr.push({
                'name': ingredientNames,
                'quantity': ingredientQuantities,
                'unit': ingredientUnits
            })
        }
        // console.log(publisher);
        // console.log(user);

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

exports.exploreRecipe = async (req, res) => {
    try {
        console.log(req.params.id);
        const recipe = await Recipe.findById(req.params.id);
        if (recipe !== null) {
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
        console.log(req.params.id);
        const recipes = await Recipe.find({
            'category': req.params.id
        });
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

exports.searchRecipe = async (req, res) => {
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

exports.latestRecipes = async (req, res) => {
    try {
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

exports.popularRecipes = async (req, res) => {
    try {
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
        const recipes = await Recipe.find({
            'author': req.user
        }).sort({
            _id: -1
        }).lean();

        if (recipes !== null && recipes.length > 0) {
            res.render('myrecipes', {
                'myRecipes': recipes
            });
        } else {
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
        // console.log(req.body.recipeId);
        let recipeId = req.body.recipeId;

        recipeId = mongoose.Types.ObjectId(recipeId);

        const userLikedRecipe = await User.findById(req.user, {
            'liked': {
                $elemMatch: {
                    $eq: recipeId
                }
            },
            '_id': 0
        });

        if (userLikedRecipe.liked.length == 0) {
            const updateLike = await Recipe.findByIdAndUpdate(recipeId, {
                $inc: {
                    "likes": 1
                }
            })
            let updateUserLikedRecipes = null;

            // console.log(req.user);
            console.log(recipeId);

            updateUserLikedRecipes = await User.findByIdAndUpdate(req.user, {
                $push: {
                    liked: recipeId
                }
            });

            // console.log(updateLike);
            // console.log(updateUserLikedRecipes);

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

        const updateLike = await Recipe.findByIdAndUpdate(recipeId, {
            $inc: {
                "likes": -1
            }
        })
        let updateUserLikedRecipes = null;

        console.log(recipeId);

        recipeId = mongoose.Types.ObjectId(recipeId);
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

exports.saveRecipe = async (req, res) => {
    try {
        let recipeId = req.body.recipeId;

        console.log(recipeId);

        let recipeObjectId = mongoose.Types.ObjectId(recipeId);

        console.log(recipeObjectId);

        const findRecipe = await User.findById(req.user, {
            'saved': {
                $elemMatch: {
                    $eq: recipeObjectId
                }
            },
            '_id': 0
        });

        // console.log(findRecipe.saved.length);

        if (findRecipe.saved.length === 0) {
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

exports.unsaveRecipe = async (req, res) => {
    try {
        let recipeId = req.body.recipeId;

        let recipeObjectId = mongoose.Types.ObjectId(recipeId);
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