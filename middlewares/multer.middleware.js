const multer = require("multer");
const path = require("path");


const maxFileSize = 4 * 1024 * 1024;


const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "images"); //
    },
    filename: (req, file, callback) => {
        const name = file.originalname.split(" ").join("_");

        const fileNameWithoutExtension = path.parse(name).name;
        callback(
            null,
            fileNameWithoutExtension + "_" + Date.now() + "_resized.jpg"
        );
    },
});


const fileFilter = (req, file, callback) => {

    if (file.mimetype.startsWith("image/")) {
        callback(null, true);
    } else {
        console.log(
            "Type de fichier non pris en charge par la serveur :",
            file.mimetype + "!!"
        );
        callback(new Error("Le fichier doit être une image..."), false);
    }
};

module.exports = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: maxFileSize },
}).single("image");