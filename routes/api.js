//
// /api routes
//

const router = require("express").Router();
const cloudinary = require("../cloudinary/cloudinary");
const { multiUploads } = require("../multer/multiUploads");

// CLOUDINARY TAG RETRIEVE/ADD/REMOVE

// CLOUDINARY TAG RETRIEVE
// -
// Returns a json array of tags for given public_id(s)
router.post("/tags", (req, res) => {
    if (!req.body.ids) throw new Error("You must include an array of public_ids!")
    var ids = req.body.ids;
    var tags = [];
    ids = Array.from(ids);
    cloudinary.v2.api.resources(
        {
            public_ids: ids,
            tags: true
        },
        (error, result) => {
            console.log(result);
            result.resources.map((item) => {
                tags.push(item.tags);
            });
            console.log("Admin API queries left: " + result.rate_limit_remaining + "/" + result.rate_limit_allowed);
            console.log("Rate resets hourly. Next reset: " + result.rate_limit_reset_at);
            res.json(tags);
        }
    )
});

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
        if (!req.body.tags) throw new Error("At least one image tag per image is required!")
        var tags = req.body.tags;
        // Map each uploaded file to cloudinary upload
        req.files.map((item, index) => {

            // Craft data URI from file upload
            var URI = "data:" + item.mimetype + ";base64," + item.buffer.toString("base64");
            // Upload image with (if any) provided tags
            cloudinary.v2.uploader.upload(URI, {tags: tags[index]} );
            // Log uploaded images
            console.log("Uploaded:" + item.originalname);

        });
        res.status(200).json({ message: "Success!" });
    } catch (error) {
        console.log(error)
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