//
// cloudinary_helpers.js
//
// -    Prepares some helper methods that are used throughout this backend to transform
//      and serve cloudinary images and image public_id's
//
// Cloudinary Helper functions:
// 
// cloudinarySearch(req,res,expression,max=null)
//      Searches for image(s) with provided expression. Caps result count
//      to max (null, meaning 50 per cloudinary's docs, by default)
//      returns: json array of found images' with transformations specified by any
//          json data in the request body.
// 
// cloudinarySearchId(req,res,expression,max=null)
//      Searches for image(s) with provided expression. Caps result count
//      to max (null, meaning 50 per cloudinary's docs, by default)
//      returns: json array of found images' public_id's that match expression
//
// -----------------------------------------------------------------------------------------

const cloudinary = require("../cloudinary/cloudinary")

// NOT WORKING, might need premium
//
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
  // Grab transform data from body
  var transforms = req.body.transformation;

  // Make search on Cloudinary cdn with provided expression
  cloudinary.v2.search
  .expression(expression)
  .max_results(max === null ? 500 : max)
  .execute()
  .then((result) => {

    // Prepare urls array to store returned urls
    var urls = [];

    // If any transforms are included...
    if (transforms) {

      // Map resources (the array of image results that cloudinary returns)
      result.resources.map((item) => {
        // Add each generated url with transforms to urls[]
        urls.push(
          cloudinary.url(
            item.filename + "." + item.format, 
            // Spread transformations from json data in body
            {transformation: [{ ...transforms }]}
          )
        );
      });

    } else {
      // If no transforms are supplied, do the above, minus transforms
      result.resources.map((item) => {
        urls.push(cloudinary.url(item.filename + "." + item.format));
      });
    }
    res.json(urls);
  });
  
    // Fetching metadata for position (not working yet, may need premium)
    // fetch(METADATA_URL)
    //   .then(res => res.json())
    //   .then(json => console.log(json));
}

// Cloudinary public_id Search helper
function cloudinarySearchId(req, res, expression, max = null) {
  // Make search on Cloudinary cdn with provided expression
  cloudinary.v2.search
  .expression(expression)
  .max_results(max === null ? 500 : max)
  .execute()
  .then((result) => {

      // Prepare public_ids array to store returned public_ids
      var public_ids = [];

      // Map resources (the array of image results that cloudinary returns)
      result.resources.map((item) => {
          public_ids.push(item.public_id)
      });

      console.log(result)

      res.json(public_ids);
  })
}

module.exports = {
    cloudinary, cloudinarySearch, cloudinarySearchId
}