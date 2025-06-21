import multer from 'multer';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "../../public/temp")
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
        console.log("Multer.middleware.js: - This file log has to be removed --!!", file);

    }
})

export const upload = multer({ 
    storage
})