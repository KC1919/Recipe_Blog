const User = require('../models/User');
const jwt = require('jsonwebtoken');
const Recipe = require('../models/Recipe');
const bcrypt = require('bcrypt');
const path = require('path');

exports.getLogin = (req, res) => {
    try {
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

exports.postLogin = async (req, res) => {
    try {
        const user = await User.findOne({
            email: req.body.email
        });

        if (user !== null) {
            if (user.password === req.body.password) {

                //generating token
                const token = jwt.sign({
                    userId: user._id
                }, process.env.SECRET_KEY);

                //embediing jwt token inside the cookie
                res.cookie('secret', token, {
                    expires: new Date(Date.now() + 900000),
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

exports.postRegister = async (req, res) => {
    try {
        console.log(req.body);
        const newUser = User.create(req.body);
        if (newUser !== 'undefined') {
            res.status(201).json({
                message: 'User created successfully',
                status: 'success'
            });
        } else {
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

exports.getProfileSetting = async (req, res) => {
    try {

        const user = await User.findById(req.user);
        // console.log(req.user);
        // console.log(user);
        res.render('profile-settings', {
            'user': user
        });
    } catch (error) {

    }

}

exports.updateProfile = async (req, res) => {
    try {
        const name = req.body.name;
        const password = req.body.password;
        const email = req.body.email;
        const social = 'www.instagram.com/' + req.body.social;
        let image = null;

        if (req.files && Object.keys(req.files).length !== 0) {
            let profileImageFile = req.files.image;
            let profileImageName = Date.now() + " " + profileImageFile.name;
            image = profileImageName;
            let profileImagePath = path.resolve('./') + '/public/uploads/' + profileImageName;

            profileImageFile.mv(profileImagePath, (err) => {
                if (err) {
                    console.log("Error uploading profile picture");
                }
            });
        }

        // const hash = await bcrypt.hash(password, 10);

        const updateProfile = await User.findByIdAndUpdate(req.user, {
            'name': name,
            'email': email,
            'social': social,
            'password': password,
            'image': image
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

exports.getProfile = async (req, res) => {
    try {
        const myRecipes = await Recipe.find({
            user: req.params.id
        }).lean();

        res.render('profile', {
            'myRecipes': myRecipes
        });
    } catch (error) {

    }
}