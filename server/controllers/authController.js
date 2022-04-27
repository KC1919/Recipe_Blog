const User = require('../models/User');
const jwt = require('jsonwebtoken');

const getLogin = (req, res) => {
    try {
        res.render('login', {
            layout: './layouts/login',
            'title': 'Login'
        });
    } catch (error) {
        console.log(error);
    }
}

const getRegister = (req, res) => {
    try {
        res.render('register', {
            layout: './layouts/login',
            'title': 'Register'
        });
    } catch (error) {
        console.log(error);
    }
}

const postLogin = async (req, res) => {
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

const postRegister = async (req, res) => {
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

module.exports = {
    getLogin,
    getRegister,
    postLogin,
    postRegister
};