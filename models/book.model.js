const mongoose = require("mongoose");

const booksSchema = mongoose.Schema({
    userId: {type: String, required: true},
    title: {type: String, required: false},
    author: {type: String, required: false},
    imageUrl: {type: String, required: true},
    year: {type: Number, required: false},
    genre: {type: String, required: false},

    ratings: [
        {
            userId: {type: String, required: true},
            grade: {type: Number, required: true},
        },
    ],
    averageRating: {type: Number, required: true},
});

module.exports = mongoose.model("Books", booksSchema);