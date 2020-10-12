//
// /images routes
//

const router = require("express").Router();
const ImageModel = require("../mongodb/image");
const { cloudinarySearch, cloudinarySearchId } = require("../cloudinary/cloudinary_helpers");
const { json } = require("express");

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
    if (max)    { cloudinarySearchId(req, res, searchExpression, max); }
    else        { cloudinarySearchId(req, res, searchExpression) }
});

// All Image Tags
// -
// (todo: add tag search by expression)
router.get('/tags', (req, res) => {
    ImageModel.find({})
    .sort({date: 'desc'})
    .then(doc => {
        console.log(doc)
        let tags = [];
        Promise.all(doc.map((item) => {
            tags.push(item.tags);
        }))
        .then(()=> {res.json(tags)})
        .catch(e => console.error(e))
    })
    .catch(err => {
    console.error(err)
    res.status(400).json({ message: err });
    })
})


module.exports = router;