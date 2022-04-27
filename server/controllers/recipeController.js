const Category = require('../models/Category');
const Recipe = require('../models/Recipe');
const path = require('path');

//get homepage
exports.homepage = async (req, res) => {

    try {
        const limitNumber = 5;
        const categories = await Category.find({}).limit(limitNumber);

        const latestRecipes = await Recipe.find({}).sort({
            _id: -1
        }).limit(5);

        const popularRecipes = await Recipe.find({}).sort({
            'likes': -1
        }).limit(5);

        let loggedInStatus = false;

        if (typeof req.cookies['secret'] !== 'undefined') {
            loggedInStatus = true;
        }

        res.render('index', {
            'title': 'Recipe Blogs - Home',
            'categories': categories,
            'latestRecipes': latestRecipes,
            'loggedInStatus': loggedInStatus,
            'popularRecipes':popularRecipes,
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

        const user = await User.find({
            _id: req.user
        });
        let publisher = '';

        if (user) {
            publisher = user.name;
        }

        //creating and saving the recipe in the database
        const newRecipe = {
            author: req.user,
            publisher: publisher,
            name: req.body.name,
            image: newImageName,
            ingredients: req.body.ingredients,
            steps: req.body.steps,
            category: req.body.category
        };

        const recipe = await Recipe.create(newRecipe);

        if (recipe) {
            console.log("Recipe saved successfully!");
        }

    } catch (error) {
        console.log(error);
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
            res.render('categories', {
                'title': 'Recipi Blog - Recipi',
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
            _id: -1
        }).limit(20);

        res.render('recipes', {
            'recipes': recipes
        });
    } catch (error) {

    }
}

exports.myRecipes = async (req, res) => {
    try {
        const recipes = await Recipe.find({
            user: req.user
        }).sort({
            _id: -1
        }).lean();

        if (recipes !== null && recipes.length > 0) {
            res.render('recipes', {
                'recipes': recipes
            });
        } else {
            res.render('recipes', {
                'recipes': []
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


exports.incrementLikes = async (req, res) => {
    try {
        // console.log(req.body.recipeId);
        const recipeId=req.body.recipeId;

        Recipe.findByIdAndUpdate(recipeId,{ $inc : { "likes" : 1 } },(err)=>{
            if(err){
                console.log("Failed to update likes");
                res.status(500).json({message:"Failed to update likes",status:'failure'});
            }else{
                res.status(200).json({message:"Likes updated successfully",status:'success'});
            }
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Failed to update likes",status:'failure'});
    }
}