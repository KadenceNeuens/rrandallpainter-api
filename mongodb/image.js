const mongoose = require("mongoose");

let imageSchema = new mongoose.Schema({
    id: String,
    tags: [String],
    creation_date: { type: Date, default: Date.now}
});

module.exports = mongoose.model("Image", imageSchema, 'tags');