// All routes for Cloudinary (will split per type next update)
const express = require("express");
const router = express.Router();
router.use(express.json()); // for parsing application/json
const multer = require("multer");
var storage = multer.memoryStorage();
var upload = multer({ storage: storage });

// Cloudinary media CDN
const cloudinary = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// const METADATA_URL =
//   "https://" +
//   process.env.API_KEY +
//   ":" +
//   process.env.API_SECRET +
//   "@api.cloudinary.com/v1_1/" +
//   process.env.CLOUD_NAME +
//   "/metadata_fields";

// Cloudinary Search helper
function cloudinarySearch(req, res, expression, max = null) {
  var data = req.body;
  cloudinary.v2.search
    .expression(expression)
    .max_results(max === null ? 500 : max)
    .execute()
    .then((result) => {
      var urls = [];
      if (data) {
        result.resources.map((item, index) => {
          urls.push(
            cloudinary.url(item.filename + "." + item.format, {
              transformation: [{ ...data }],

            })
          );
        });
      } else {
        result.resources.map((item, index) => {
          urls.push(cloudinary.url(item.filename + "." + item.format));
        });
      }
      console.log(JSON.stringify(urls, null, 2));
      res.json(urls);
    });

  // Fetching metadata for position (not working yet, may need premium)
  // fetch(METADATA_URL)
  //   .then(res => res.json())
  //   .then(json => console.log(json));
}

// Cloudinary public_id Search helper
function cloudinarySearchId(req, res, expression, max = null) {
    cloudinary.v2.search
    .expression(expression)
    .max_results(max === null ? 500 : max)
    .execute()
    .then((result) => {
        var public_ids = []
        result.resources.map((item) => {
            public_ids.push(item.public_id)
        })
        console.log(JSON.stringify(urls, null, 2));
        res.json(public_ids);
    })
}

//------------------------------------------------------------
// GET - GET responses to return image public id's for processing

// All Images
router.get('images', (req, res) => {
    cloudinarySearchId(req, res, "resource_type:image")
})

// Residential Images
router.get('images/residential', (req, res) => {
    cloudinarySearchId(req, res, "resource_type:image AND tags=residential")
})

// Commercial Images
router.get('images/commercial', (req, res) => {
    cloudinarySearchId(req, res, "resource_type:image AND tags=commercial")
})

// Header Image
router.get('images/header', (req, res) => {
    cloudinarySearchId(req, res, "resource_type:image AND tags=header", 1)
})

//------------------------------------------------------------
// POST - POST responses to image queries. Spreads any body data as array of transformations

// All Images
router.post("/images", (req, res) => {
    cloudinarySearch(req, res, "resource_type:image") 
})

// Residential Images
router.post("/images/residential", (req, res) => {
    cloudinarySearch(req, res, "resource_type:image AND tags=residential") 
})

// Commercial Images
router.post("/images/commercial", (req, res) => {
    cloudinarySearch(req, res, "resource_type:image AND tags=commercial") 
})

// Header Image
router.post("/images/header", (req, res) => {
    cloudinarySearch(req, res, "resource_type:image AND tags=header", 1) 
})

// Image Search
// -
// (required) Accepts a search expression (see Cloudinary Search API for details)
router.post("/images/search", (req, res) => {
    var searchExpression = req.body.expression;
    cloudinarySearch(req, res, searchExpression) 
})

/////////////////////////////////////////////////
// REQUIRE ADMIN PRIV ANYWHERE FURTHER

app.use("/", (req, res, next) => {
    if (req.session.type === "admin") {
        res.end("Welcome back, Big Chungus!");
        next();
    }
    else
    {
        res.status(401).json({message: "unauthorized!"})
    }
});

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

// CLOUDINARY IMAGE UPLOAD
// -
// (required) Accepts single or multi-file upload
// (optional) Accepts array of tags under "tags" in body to add to upload.
router.post("/api/upload", multiUploads, (req, res) => 
{
    try {
        // Check if upload exists
        if (!req.files) throw new Error("Image upload failed!");
        // Gather tags
        var data = req.body
        // Map each uploaded file to cloudinary upload
        req.files.map((item) => {
            // Craft data URI from file upload
            var URI = "data:" + item.mimetype + ";base64," + item.buffer.toString("base64");
            // Upload image with (if any) provided tags
            cloudinary.v2.uploader.upload(URI, {tags: [{...data.tags}]} );
            // Log uploaded images
            console.log("Uploaded:" + item.originalname);
        });
        res.status(200).json({ message: "Success!" });
    } catch (error) {
        res.status(422).json({ message: error.message });
    }
});

// CLOUDINARY IMAGE DELETE
// -
// (required) Accepts array of filenames (without file extension!) to delete under "files" in body
router.delete("/api/delete", (req, res) => {
    try {
        if (!req.body) throw new Error("Failed, no image public id given!")
        // get names of files to be deleted
        var data = req.body.files
        // Map each file scheduled to be deleted
        data.map((item) => {
            cloudinary.v2.uploader.destroy(item)
        })
        res.status(200).json({ essage: "Successfully deleted: " + {...data} })
    } catch(error) {
        res.status(422).json({ message: error.message })
    }
})

module.exports = router;