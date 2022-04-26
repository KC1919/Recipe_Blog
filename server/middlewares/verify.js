const jwt = require('jsonwebtoken');

const verify = async (req, res, next) => {
    try {
        const token = req.cookies['secret'];
        const payload = jwt.verify(token, process.env.SECRET_KEY);
        if (payload !== null) {
            req.user = payload.userId;
            next();
        }
    } catch (error) {
        console.log("Error in verification, server error");
        // res.status(500).json({
        //     message: 'Error in verification, server error',
        //     status: 'failure',
        //     error: error
        // })
        res.redirect('/auth/login');
    }
}

module.exports = verify;