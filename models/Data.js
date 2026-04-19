const mongoose = require("mongoose");

const DataSchema = new mongoose.Schema({
  server: String,
  type: String,
  code: String,
  issue: String,
  severity: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Data", DataSchema);