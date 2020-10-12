//
// /api routes
//

const router = require("express").Router();
const ImageModel = require("../mongodb/image");
const cloudinary = require("../cloudinary/cloudinary");
const { multiUploads } = require("../multer/multiUploads");

// CLOUDINARY TAG RETRIEVE & UPDATE

// CLOUDINARY TAG RETRIEVE
// -
// Returns a json array of tags for given public_id(s)
router.post("/tags", (req, res) => {
    // Check if public_ids were supplied, then grab them
    if (!req.body.ids) throw new Error("You must include an array of public_ids!");
    var ids = req.body.ids;
    // init tags array to hold response for later
    var tags = [];
    cloudinary.v2.api.resources_by_ids(
        ids,
        {tags: true},
        (error, result) => {
            console.log(result, error);
            // Map through each resource returned and store resulting tags in tags
            result.resources.map((item) => {
                tags.push(item.tags);
            });
            // There is a 500 calls/hr limit to Admin API calls for Cloudinary under the free plan
            console.log("Admin API queries left: " + result.rate_limit_remaining + "/" + result.rate_limit_allowed);
            console.log("Rate resets hourly. Next reset: " + result.rate_limit_reset_at);
            res.json(tags);
        }
    )
});

// CLOUDINARY TAG UPDATE
// -
// (required) ids - an array of strings containing public_ids.
// (optional) tags - an array of tags to add to the resources. If none are supplied, all tags will be removed from resources.
router.put("/tags/update", (req,res) => {
    // Check if public_ids were supplied, then grab them
    if (!req.body.ids) throw new Error("You must include an array of public_ids!");
    var ids = req.body.ids;
    // If tags are supplied, add them after removing all tags, otherwise remove all tags.
    if (req.body.tags)
    {
        var tags = req.body.tags;
        cloudinary.v2.uploader.remove_all_tags(
            ids,
            (error,result) => {

                // Update all Mongo references
                ImageModel.updateMany( { id: { $in: [...ids] } }, { $set: { tags : [] } })
                .then(doc => { console.log(doc) })
                .catch(err => { console.error(err) })

                // Map each tag to a add_tag() call for all resources
                tags.map((item) => {

                    cloudinary.v2.uploader.add_tag(
                        item,
                        ids,
                        (error2,result2) => {
                            console.log("Added tag: " + item + "...to: " + result2.public_ids, !error2 ? "" : error2);
                        }
                    )
                    
                    // Update all Mongo references
                    ImageModel.updateMany( { id: { $in: [...ids] } }, { $push: { tags : item } })
                    .then(doc => { console.log(doc) })
                    .catch(err => { console.error(err) })

                    });
                res.status(200).json({ message: "Successfully updated tags"});
            }
        )
    }
    else // Remove all tags when none are supplied in input
    {
        cloudinary.v2.uploader.remove_all_tags(
            ids,
            (error, result) =>
            {
                console.log("Removed all tags from: " + result.public_ids, !error ? "" : error);

                // Update all Mongo references
                ImageModel.updateMany( { id: { $in: [...ids] } }, { $set: { tags : [] } })
                .then(doc => { console.log(doc) })
                .catch(err => { console.error(err) })
                    
                res.status(200).json({ essage: "Successfully removed all tags"});
            })
    }
    
})

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
        var tags = [req.body.tags];
        console.log("TAGS",tags);
        // Map each uploaded file to cloudinary upload
        Promise.all(req.files.map((item, index) => {

            // Craft data URI from file upload
            var URI = "data:" + item.mimetype + ";base64," + item.buffer.toString("base64");

            // Store data for ImageModel object
            let newItemData = { id: "", tags: []};

            // Upload image with (if any) provided tags
            cloudinary.v2.uploader.upload(URI, {tags: tags[index]},
                (error, result) => {
                    console.log(error, result);
                    if(error) res.status(422).json({ message: error })
                    
                    // Update ImageModel Object
                    newItemData.id = result.public_id.valueOf(),
                    newItemData.tags = tags[index].split(',')

                    console.log(newItemData.tags);
                    console.log(newItemData);

                    var newItem = new ImageModel(newItemData);

                    // Save new ImageModel data in Mongo to grab tags from later
                    newItem.save()
                    .then(doc => { console.log(doc) })
                    .catch(err => { console.error(err) });
                    res.status(200).json({ message: "Success!" }); 
                }
                );
            // Log uploaded images
            console.log("Uploaded:" + item.originalname);

            console.log(URI);
        }))
        .then(() => {
            
        })
    } catch (error) {
        console.log(error)
        res.status(422).json({ message: error.message });
    }
});

// CLOUDINARY IMAGE DELETE
// -
// (required) Accepts array of filenames (without file extension!) to delete under "files" in body
router.post("/delete", (req, res) => {
    try {
        if (!req.body) throw new Error("Failed, no image public id given!");
        // get names of files to be deleted
        var data = req.body.ids;
        // Map each file scheduled to be deleted
        data.map((item) => {
            cloudinary.v2.uploader.destroy(item, (error, result) => {
                ImageModel.deleteMany({ id: { $in: [...ids] } })
                .then(doc => { console.log(doc) })
                .catch(err => { console.error(err) })
                res.status(200).json({ message: "Successfully deleted: " + {data} });
            });

        });
        
    } catch(error) {
        res.status(422).json({ message: error.message });
    }
})

module.exports = router