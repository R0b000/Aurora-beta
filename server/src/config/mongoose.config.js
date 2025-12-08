const mongoose = require('mongoose');
const { mongooseConfig } = require('./const.config');

(async() => {
    try {
        await mongoose.connect( mongooseConfig.url,{
            dbName: mongooseConfig.dbName,
            autoCreate: true
        });

        console.log("MongoDB connected succesfully");
    } catch (error) {
        console.log("Error connecting to MongoDB", error);
        process.exit(1);
    }
})()