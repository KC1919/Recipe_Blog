const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const app = express();
const cookieParser = require('cookie-parser');
const connectDB = require('./server/middlewares/db');

const fileUpload = require('express-fileupload');
const session = require('express-session');
const flash = require('connect-flash');

require('dotenv').config({
    path: './config/config.env'
});

app.use(cookieParser());
app.use(session({
    secret: 'FoodBlogSecretSession',
    saveUninitialized: true,
    resave: true
}));

app.use(flash());
app.use(fileUpload({
    limits: {
        fileSize: 50 * 1024 * 1024
    },
}));

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

app.use(express.static('public'));
app.use(expressLayouts);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');


const recipeRouter = require('./server/routes/recipeRoutes');
app.use('/', recipeRouter);

const authRouter = require('./server/routes/authRoutes');
app.use('/auth/', authRouter);


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server listening on port " + PORT);
    connectDB();
})