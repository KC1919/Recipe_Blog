const User = require('../models/User');
const jwt = require('jsonwebtoken');
const Recipe = require('../models/Recipe');
const bcrypt = require('bcrypt');
const path = require('path');

//fetching the login page
exports.getLogin = (req, res) => {
    try {

        //rendering the login page, with login layout
        res.render('login', {
            layout: './layouts/login',
            'title': 'Login'
        });
    } catch (error) {
        console.log(error);
    }
}

exports.getRegister = (req, res) => {
    try {
        res.render('register', {
            layout: './layouts/login',
            'title': 'Register'
        });
    } catch (error) {
        console.log(error);
    }
}

//logging in the user
exports.postLogin = async (req, res) => {
    try {

        //getting the user email and password
        const email = req.body.email;
        const password = req.body.password;

        //looking for the user in the database with the provided email id
        const user = await User.findOne({
            email: email
        });

        //if the user is found in the database
        if (user !== null) {

            //we compare the user password with that saved in the database
            if (user.password === password) {

                //generating jsonwebtoken for authentication of subsequent requests of the user
                const token = jwt.sign({
                    userId: user._id
                }, process.env.SECRET_KEY);

                //embeding jwt token inside the cookie
                await res.cookie('secret', token, {
                    expires: new Date(Date.now() + 86400), //setting the expiry date of the cookie to 24 hours from the login time of the  user
                    httpOnly: true
                });

                res.status(200).json({
                    message: 'Logged in successfully',
                    status: 'success'
                });
            } else {
                res.status(401).json({
                    message: 'Invalid email or password',
                    status: 'failure'
                });
            }
        } else {
            res.status(401).json({
                message: 'User does not exist',
                status: 'failure'
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Server error',
            status: 'failure',
            error: error
        });
    }
}

//registering the user
exports.postRegister = async (req, res) => {
    try {

        //creating the user with the user info fetched from the registration form filled by the user
        const newUser = User.create(req.body);

        //if the user is created successfully, we send a success message
        if (newUser !== 'undefined') {
            res.status(201).json({
                message: 'User created successfully',
                status: 'success'
            });
        }
        //if the user creation fails, we send a failure message
        else {
            res.status(400).json({
                message: 'Failed to create user',
                status: 'failure'
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Failed to create user,internal server error',
            error: error
        });
    }
}

//fetching the user profile settings page
exports.getProfileSetting = async (req, res) => {
    try {

        //fetching the user data of the loggedin user from the database
        const user = await User.findById(req.user);

        // rendering the profile settings page with the user info
        res.render('profile-settings', {
            'user': user
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error fetching profile settings, server error",
            status: "failure"
        })
    }

}

//updating the user profile with the posted form data
exports.updateProfile = async (req, res) => {
    try {
        const name = req.body.name;
        const password = req.body.password;
        const email = req.body.email;
        const social = req.body.social;
        let image = null;

        // const user = await User.findById(req.user);

        if (req.files && Object.keys(req.files).length !== 0) {

            //getting the image file uploaded by the user
            let profileImageFile = req.files.image;

            //renaming the image file with current date and the original name of the image uploaded
            let profileImageName = Date.now() + " " + profileImageFile.name;

            //defining the path, where the image will be saved 
            let profileImagePath = path.resolve('./') + '/public/uploads/' + profileImageName;

            //we check if the image already exists for the user in the database
            let userImage = await User.findById(req.user, {
                'image': 1
            });

            //if exists
            if (userImage.image.length !== 0) {
                const fs = require('fs')

                //then we get the path of the existing image
                const path = './public/uploads  /' + userImage.image

                //deleting the existing image
                fs.unlink(path, (err) => {
                    if (err) {
                        console.error(err)
                        return;
                    }
                    //file removed
                })
            }

            //then updating the image of the user with the uploaded image
            await User.findByIdAndUpdate(req.user, {
                'image': profileImageName
            })

            //saving the uploaded image to the destination path
            profileImageFile.mv(profileImagePath, (err) => {
                if (err) {
                    console.log("Error uploading profile picture");
                }
            });
        }

        // // const hash = await bcrypt.hash(password, 10);

        //finally updating the user data in the database
        const updateProfile = await User.findByIdAndUpdate(req.user, {
            'name': name,
            'email': email,
            'social': social,
            'password': password,
        })

        res.status(200).json({
            message: 'profile updated successfully',
            status: 'success'
        });

    } catch (error) {
        console.log(error);
        console.log("profile updation failed, server error");
        res.status(500).json({
            message: 'profile updation failed, server error',
            status: 'failure',
            error: error
        });
    }
}

//fetching the user profile
exports.getProfile = async (req, res) => {
    try {

        //gettin the id of the user from the url
        const userId = req.params.id;

        // console.log(userId);

        //findin all the recipes posted by the user
        const recipes = await Recipe.find({
            author: userId
        }).lean();

        // console.log(recipes);

        //then getting the data of the user
        const user = await User.findById(userId);

        // console.log(user);

        //creating an object with the user info.
        const userInfo = {
            'username': user.name,
            'social': user.social,
            'contact': user.email
        }

        if (recipes !== null && user !== null) {
            console.log(userInfo);

            //finally rendering the profile page, with user info and user's recipes
            res.render('profile', {
                'recipes': recipes,
                'user': user
            });
        } else {
            console.log("Failed to fetch profile");
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Failed to fetch user profile",
            status: 'failure'
        });
    }
}

//logging out the user
exports.logout = async (req, res) => {
    try {

        //clearing the authorization cookie
        res.clearCookie("secret");

        //finally redirecting the user too the login page
        res.redirect("/auth/login");

    } catch (error) {
        console.log("Logout failed", error);
        res.status(500).jason({
            message: "Failed to logout user, server error",
            status: "failure",
            error: error
        });
    }
}