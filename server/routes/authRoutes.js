const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyUser = require('../middlewares/verify');

//User authentication routes

//Get Login route
router.get('/login', authController.getLogin);

//Get register route
router.get('/register', authController.getRegister);

//Post Login route
router.post('/login', authController.postLogin);

//Post register route
router.post('/register', authController.postRegister);

router.get('/profile-setting', verifyUser, authController.getProfileSetting);

router.post('/update-profile', verifyUser, authController.updateProfile);

router.get('/profile/:id', verifyUser, authController.getProfile)

router.get('/logout', verifyUser, authController.logout);

module.exports = router;