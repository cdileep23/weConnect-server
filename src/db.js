const mongoose = require("mongoose");



const connectDB = async () => {
  try {
   
  
    await mongoose.connect("mongodb+srv://cdileep22:KDcU5cxyZ8PqyIqs@cluster0.dz51s.mongodb.net/", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    throw err;
  }
};

module.exports = connectDB;
