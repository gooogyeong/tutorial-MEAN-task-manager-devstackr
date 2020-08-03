//this file will handle connection logic to MongoDB database

const mongoose = require("mongoose");

//Since mongoose uses bluebird for their Promise,
//we're setting it to use global JavaScript Promise instead.
mongoose.Promise = global.Promise;

//params #1 = uri
//27017 = default port
// TaskManager = name of our database
//!params #2 = option
mongoose
  .connect("mongodb://localhost:27017/TaskManager", { useNewUrlParser: true })
  .then(() => {
    console.log("Connected to MongoDB successfully!");
  })
  .catch((e) => {
    console.log("Error while attempting to connect to MongoDB");
    console.log(e);
  });

//! set some properties to prevent deprectation warnings (from MongoDB native driver)
mongoose.set("useCreateIndex", true);
mongoose.set("useFindAndModify", false);
//https://mongoosejs.com/docs/api.html
//'useFindAndModify': true by default. Set to false to make findOneAndUpdate() and findOneAndRemove() use native findOneAndUpdate() rather than findAndModify().

//export mongoose object
module.exports = {
  mongoose,
};
