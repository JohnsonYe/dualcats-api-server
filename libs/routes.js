/** dependencies */
const router = require('express').Router();
const { AwsBucket } = require('./dataSources');
const imageRoutes = require('./routes/imageRoutes');
const userRoutes = require('./routes/usersRoutes');
/** import image router into router
 */
router.use("/images", imageRoutes);

router.use("/users", userRoutes);

// router.get("/getImageRawData" , async (req, res, next) => {
//     var bucket = new AwsBucket();
//     try {
//         var rawData = await bucket.getObjectRawData("dualcats");
//         // console.log(rawData);
//         res.send({success : true, rawData: rawData});
//     } catch (err) {
//         return next(err);
//     }
// });

// router.post("/uploadFileTobucket", async (req, res) => {
//     let data = {
//         buffer: req.files.file.data,
//         name: req.files.file.name
//     };
//     let bucket = new AwsBucket();
//     bucket.uploadFile(data).then((response) =>{
//         res.send({success: true, response: response});
//     }).catch((err) => {
//         next(err);
//     });
// });

// router.delete("/deleteFileFromBucket/:key", async (req, res) => {
//     let bucket = new AwsBucket();
//     try {
//         let response = await bucket.removeFile(req.params.key)
//         res.send({success: true, message: response});
//     } catch (err) {
//         next(err);
//     }
// });

module.exports = router;