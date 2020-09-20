//
// /images routes
//

const router = require("express").Router();
const { cloudinarySearch, cloudinarySearchId } = require("../cloudinary/cloudinary_helpers");

//------------------------------------------------------------
// POST - POST response to image queries. Spreads any body data as array of transformations

// All Images
router.post("/", (req, res) => {
    cloudinarySearch(req, res, "resource_type:image") 
})

// Residential Images
router.post("/residential", (req, res) => {
    cloudinarySearch(req, res, "resource_type:image AND tags=residential") 
})

// Commercial Images
router.post("/commercial", (req, res) => {
    cloudinarySearch(req, res, "resource_type:image AND tags=commercial") 
})

// Header Image
router.post("/header", (req, res) => {
    cloudinarySearch(req, res, "resource_type:image AND tags=header", 1) 
})

// Image Search
// -
// (required) Accepts a search expression (see Cloudinary Search API for details)
router.post("/search", (req, res) => {
    var searchExpression = req.body.expression;
    cloudinarySearch(req, res, searchExpression) 
})

//------------------------------------------------------------
// GET - GET response returns image public id's for processing

// All Images
router.get('/', (req, res) => {
    cloudinarySearchId(req, res, "resource_type:image")
})

// Residential Images
router.get('/residential', (req, res) => {
    cloudinarySearchId(req, res, "resource_type:image AND tags=residential")
})

// Commercial Images
router.get('/commercial', (req, res) => {
    cloudinarySearchId(req, res, "resource_type:image AND tags=commercial")
})

// Header Image
router.get('/header', (req, res) => {
    cloudinarySearchId(req, res, "resource_type:image AND tags=header", 1)
})

module.exports = router