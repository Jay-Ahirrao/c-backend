import multer from 'multer';
import fs from 'fs';
import path from 'path';

const uploadDir = path.join(process.cwd(), 'public', 'temp');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);        
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
        console.log(req.files);
        console.log(file.fieldname);
        console.log(file);
        
    }
});

export const upload = multer({ storage: storage });


