const Category = require('../models/Category');

//get homepage
exports.homepage = async (req, res) => {

    try {
        const limitNumber = 5;
        const categories = await Category.find({}).limit(limitNumber);
        res.render('index', {
            'title': 'Recipe Blogs - Home',
            'categories': categories,
        });
    } catch (error) {
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

// async function insertDummyRecipeData() {
//     try {
//         await Category.insertMany([{
//                 name: 'South Indian',
//                 image: 'dosa.jpg'
//             },
//             {
//                 name: 'North Indian',
//                 image: 'pav-bhaji.jpg'
//             },
//             {
//                 name: 'Butter Chicken',
//                 image: 'butter-chicken.jpg'
//             },
//             {
//                 name: 'Continental',
//                 image: 'rajma.jpg'
//             },
//             {
//                 name: 'Punjabi',
//                 image: 'chole.jpg'
//             }
//         ]);

//     } catch (error) {
//         console.log("Error: ", error);
//     }
// }

// insertDummyRecipeData();