const mongoose = require('mongoose');

const connect = async () => {
    try {
        const conn = await mongoose.connect(process.env.DB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        if (conn) {
            console.log("Database Connected");
        }else{
            console.log("Failed to connect database");
        }
    } catch (error) {
        console.log("Database connection failed, internal server error");
        console.error(error);
    }
}

module.exports=connect;