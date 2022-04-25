const User = require('../models/User');

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


    } catch (error) {
        console.log(error);
    }
}

const postRegister = async (req, res) => {
    try {
        console.log(req.body);
        const newUser = User.create(req.body);
        if (newUser !== 'undefined') {
            res.status(201).json({
                message: 'User created successfully',
                status:'success'
            });
        } else {
            res.status(400).json({
                message: 'Failed to create user',
                status:'failure'
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