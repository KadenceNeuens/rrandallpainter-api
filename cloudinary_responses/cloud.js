// GET Responses for Cloudinary
const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
router.use(bodyParser.json()) // for parsing application/json
const multer = require('multer')
var storage = multer.memoryStorage()
var upload = multer({ storage: storage })

// Cloudinary media CDN
const cloudinary = require('cloudinary')

cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET 
  });

const METADATA_URL = 'https://'+process.env.API_KEY+':'+process.env.API_SECRET+'@api.cloudinary.com/v1_1/'+process.env.CLOUD_NAME+'/metadata_fields'

function cloudinarySearch(req, res, expression, max=null)
{
    var data = req.body
    console.log(req.body)
    cloudinary.v2.search
    .expression(expression)
    .max_results(max === null ? 500 : max)
    .execute().then( result => {
        var urls = []
        if (req.body)
        {
            result.resources.map((item, index) => {
                urls.push(cloudinary.url(item.filename+'.'+item.format, {transformation: [{...data}]}))
                console.log(urls)
            })
        }
        else
        {
            result.resources.map((item, index) => {
                urls.push(cloudinary.url(item.filename+'.'+item.format))
                console.log(urls)
            })
        }
        console.log(JSON.stringify(urls, null, 2))
        res.json(urls)
    });

    // Fetching metadata for position (not working yet)
    // fetch(METADATA_URL)
    //   .then(res => res.json())
    //   .then(json => console.log(json));
}

//-------------------------------------
// GET

// All Images
router.post('/images', (req, res) => {
    cloudinarySearch(req, res, 'resource_type:image')
})
  
// Residential Images
router.post('/images/residential', (req, res) => {
    cloudinarySearch(req, res, 'resource_type:image AND tags=residential')
})
  
// Commercial Images
router.post('/images/commercial', (req, res) => {
    cloudinarySearch(req, res, 'resource_type:image AND tags=commercial')
})

router.post('/images/header', (req, res) => {
    cloudinarySearch(req, res, 'resource_type:image AND tags=header', 1)
})

router.post('/images/search', (req, res) => {
    var searchExpression = req.body.expression
    cloudinarySearch(req, res, searchExpression, 1)
})

const multiUpload = upload.array('images');

const multiUploads = (req, res, next) => {
  multiUpload(req, res, (error) => {
    if (error) {
      return res.sendApiError(
        { title: 'Upload Error',
          detail:  error.message});
      }
    next();
  })
}

router.post('/api/upload', multiUploads, (req, res) => {
    try {
        if(!req.files) throw new Error("Image upload failed!")
        req.files.map((item, index) => {
            cloudinary.v2.uploader.upload(item[index])
            console.log("Uploaded:" + item[index])
        })
        res.status(200).json({ message: "Success!" })
    }
    catch(error)
    { res.status(422).json({ message: error.message }) }
})

module.exports = router