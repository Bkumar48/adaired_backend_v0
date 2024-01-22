require('dotenv').config();
const mongoose = require('mongoose')
mongoose.set('strictQuery', false);
mongoose.connect(
    process.env.MONGO_DB_URI, 
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);
const db = mongoose.connection;
module.exports = db;