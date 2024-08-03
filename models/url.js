const mongoose = require("mongoose");

const urlSchema = mongoose.Schema({
  originalUrl: String,
  shortUrl: String
});

const URL = mongoose.model("URL",urlSchema);

module.exports = URL