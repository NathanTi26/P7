const bookModel = require("../models/book.model");
const fs = require('fs');

exports.getAllBooks = async (req, res) => {
    try {
        const books = await bookModel.find();
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ error: "Impossible de récupérer les livres" });
    }
};

exports.getBookById = async (req, res) => {
    try {
        const book = await bookModel.findOne({ _id: req.params.id });
        if (!book) {
            return res.status(404).json({ error: "Impossible de trouver le livre" });
        }
        res.status(200).json(book);
    } catch (error) {
        res.status(500).json({ error: "Impossible de récupérer les livres" });
    }
};



exports.addBook = (req, res) => {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;
    const book = new bookModel({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get("host")}/book_picture/${req.file.filename
            }`,
    });
    book.save().then(() => {
        console.log(`Nouveau livre: ${bookObject.title}`);
        res.status(201).json({ message: "Livre enregistré avec succès" });
    })
        .catch((error) => {
            console.log(error);
            res.status(400).json({ error });
        });
};


exports.modifyBook = (req, res) => {
    const bookObject = req.file
        ? {
            ...JSON.parse(req.body.book),
            userId: req.auth.userId,
            imageUrl: `${req.protocol}://${req.get("host")}/book_picture/${req.file.filename}`,
        }
        : { ...req.body };

    delete bookObject._userId;

    bookModel.findOne({ _id: req.params.id }).then((book) => {
        if (book.userId !== req.auth.userId) {
            res.status(401).json({ message: "Vous ne pouvez pas modifier ce livre." });
        } else {
            bookModel.updateOne(
                { _id: req.params.id },
                { ...bookObject, _id: req.params.id }
            )
                .then(() => res.status(200).json({ message: "Livre modifié!" }))
                .catch((error) => res.status(401).json({ error }));
        }
    })
        .catch((error) => {
            console.log(error);
            res.status(400).json({ error });
        });
};

exports.deleteBook = (req, res, next) => {
    bookModel.findOne({ _id: req.params.id }).then((book) => {
        if (book.userId !== req.auth.userId) {
            res.status(401).json({ message: "Vous ne pouvez pas modifier ce livre." });
        } else {
            const filename = book.imageUrl.split("/images/")[1];
            console.log(filename);
            fs.unlink(`images/${filename}`, (err) => {
                if (err) {
                    res.status(500).json({ error: "Une erreur est survenue durant la supréssion." });
                } else {
                    bookModel.deleteOne({ _id: req.params.id }).then(() => {
                        res.status(200).json({ message: "Livre supprimé" });
                    }).catch((error) => {
                        res.status(401).json({ error });
                    });
                }
            });
        }
    }).catch((error) => {
        res.status(500).json({ "Une erreur est survenue durant la supréssion": error });
    });
};
exports.ratingBook = (req, res) => {
    const url = req.url;
    const urlId = url.split('/')[1];
    const bookFilter = { _id: urlId };
    const updatedUserId = req.body.userId;
    const updatedGrade = req.body.rating;
    console.log(req.body);
    const updatedData = {
        userId: updatedUserId,
        grade: updatedGrade,
    };

    bookModel.UpdateRating(
        bookFilter,
        { $push: { ratings: updatedData } },
        { new: true }
    ).then((updatedBook) => {
        const totalRatings = updatedBook.ratings.length;
        const ratingsSum = updatedBook.ratings.reduce(
            (acc, rating) => acc + rating.grade,
            0
        );
        updatedBook.averageRating = ratingsSum / totalRatings;

        return updatedBook.save();
    }).then((book) => {
        res.status(200).json(book);
    }).catch((error) => res.status(400).json({ error }));
};