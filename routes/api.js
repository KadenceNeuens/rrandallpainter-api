//
// /api routes
//

const router = require("express").Router();
const cloudinary = require("../cloudinary/cloudinary");
const { multiUploads } = require("../multer/multiUploads");

// CLOUDINARY IMAGE UPLOAD
// -
// (required) Accepts single or multi-file upload
// (optional) Accepts array of tags under "tags" in body to add to upload.
router.post("/upload", multiUploads, (req, res) => 
{
    try {
        // Check if upload exists
        if (!req.files) throw new Error("Image upload failed!");
        // Gather tags
        var tags = req.body.tags;
        // Map each uploaded file to cloudinary upload
        req.files.map((item) => {
            tags.map((tag) => {
                // Craft data URI from file upload
                var URI = "data:" + item.mimetype + ";base64," + item.buffer.toString("base64");
                // Upload image with (if any) provided tags
                cloudinary.v2.uploader.upload(URI, {tags: [{...tag}]} );
                // Log uploaded images
                console.log("Uploaded:" + item.originalname);
            });
        });
        res.status(200).json({ message: "Success!" });
    } catch (error) {
        res.status(422).json({ message: error.message });
    }
});

// CLOUDINARY IMAGE DELETE
// -
// (required) Accepts array of filenames (without file extension!) to delete under "files" in body
router.delete("/delete", (req, res) => {
    try {
        if (!req.body) throw new Error("Failed, no image public id given!");
        // get names of files to be deleted
        var data = req.body.files;
        // Map each file scheduled to be deleted
        data.map((item) => {
            cloudinary.v2.uploader.destroy(item);
        });
        res.status(200).json({ essage: "Successfully deleted: " + {...data} });
    } catch(error) {
        res.status(422).json({ message: error.message });
    }
})

module.exports = router