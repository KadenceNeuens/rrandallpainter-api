//
//  multiUploads.js
//  
//  - Sets up Multer for multi-file upload
//

const multer = require("multer");
var storage = multer.memoryStorage();
var upload = multer({ storage: storage });

// Multer multi-file upload set up
const multiUpload = upload.array("images");
const multiUploads = (req, res, next) => 
{
    multiUpload(req, res, (error) => {
        if (error) {
            return res.status(500).json({ message: "error" });
        }
    next();
    });
};

module.exports = {
    multiUploads
}