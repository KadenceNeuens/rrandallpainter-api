// GET Responses for Cloudinary
const express = require('express')
const router = express.Router()

// Cloudinary media CDN
const cloudinary = require('cloudinary')

cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET 
  });

const METADATA_URL = 'https://'+process.env.API_KEY+':'+process.env.API_SECRET+'@api.cloudinary.com/v1_1/'+process.env.CLOUD_NAME+'/metadata_fields'

//-------------------------------------
// GET

// All Images
router.get('/images', (req, res) => {
    var data = req.body
    cloudinary.v2.search
    .expression('resource_type:image')
    .execute().then( result => {
        var urls = []
        result.resources.map((item, index) => {
            urls.push(cloudinary.image(item.filename+'.'+item.format, {data}))
            console.log(urls)
        })
        console.log(JSON.stringify(urls, null, 2))
        res.json(urls)
    });
    res.end("Returned all images")
})
  
// Residential Images
router.get('/images/residential', (req, res) => {
    var data = req.body
    console.log("JSON Stringify:")
    console.log(JSON.stringify(req.body, null, 2))
    cloudinary.v2.search
    .expression('resource_type:image AND tags=residential')
    .execute().then( result => {
        var urls = []
        result.resources.map((item, index) => {
            urls.push(cloudinary.image(item.filename+'.'+item.format, {data}))
            console.log(urls)
        })
        console.log(JSON.stringify(urls, null, 2))
        res.json(urls)
    });

    // Fetching metadata for position (not working yet)
    // fetch(METADATA_URL)
    //   .then(res => res.json())
    //   .then(json => console.log(json));
    res.end("Returned residential images")
})
  
// Commercial Images
router.get('/images/commercial', (req, res) => {
    var data = req.body
    cloudinary.v2.search
    .expression('resource_type:image AND tags=commercial')
    .execute().then( result => {
        var urls = []
        result.resources.map((item, index) => {
            urls.push(cloudinary.image(item.filename+'.'+item.format, {data}))
            console.log(urls)
        })
        console.log(JSON.stringify(urls, null, 2))
        res.json(urls)
    });
    res.end("Returned commercial images")
})

module.exports = router