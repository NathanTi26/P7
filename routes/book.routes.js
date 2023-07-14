const express = require("express");
const router = express.Router();
const bookController = require("../controllers/book.controller");

const multer = require("../middlewares/multer.middleware");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/", bookController.getAllBooks);
router.get("/:id", bookController.getBookById);
router.post("/", authMiddleware, multer, bookController.addBook);
router.put("/:id", authMiddleware, multer, bookController.modifyBook);
router.delete("/:id", authMiddleware, bookController.deleteBook);
router.post('/:id/rating', authMiddleware, bookController.ratingBook);

module.exports = router;