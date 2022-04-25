const express = require('express');
const router = express.Router();
const {
    getLogin,
    getRegister,
    postLogin,
    postRegister
} = require('../controllers/authController');

//User authentication routes

//Get Login route
router.get('/login', getLogin);

//Get register route
router.get('/register', getRegister);

//Post Login route
router.post('/login', postLogin);

//Post register route
router.post('/register', postRegister);

module.exports = router;