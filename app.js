const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const app = express();
const connectDB=require('./server/middlewares/db');

require('dotenv').config({
    path:'./config/config.env'
});

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

const authRouter=require('./server/routes/authRoutes');
app.use('/auth/',authRouter);


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server listening on port " + PORT);
    connectDB();
})