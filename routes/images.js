//
// /images routes
//

const router = require("express").Router();
const { cloudinarySearch, cloudinarySearchId } = require("../cloudinary/cloudinary_helpers");

//------------------------------------------------------------
// POST - POST response to image queries. Spreads any body data as array of transformations

// Image Search
// -
// (optional) Accepts a search expression (see Cloudinary Search API for details)
router.post("/", (req, res) => {
    var searchExpression = req.body.expression;
    var max = req.body.max;
    if (max)    { cloudinarySearch(req, res, searchExpression, max); }
    else        { cloudinarySearch(req, res, searchExpression) }
});

//------------------------------------------------------------
// GET - GET response returns image public id's for processing

// All Images
// -
// (optional) Accepts a search expression (see Cloudinary Search API for details)
router.get('/', (req, res) => {
    var searchExpression = req.body.expression;
    var max = req.body.max;
    if (max)    { cloudinarySearch(req, res, searchExpression, max); }
    else        { cloudinarySearch(req, res, searchExpression) }
});

module.exports = router;