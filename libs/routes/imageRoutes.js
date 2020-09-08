/** dependencies */
const router = require('express').Router();
// const { Bucket } = require('./dataSources');
const { Bucket } = require('../buckets');


router.get("/loadImages" , async (req, res, next) => {
    let bucket = new Bucket('dualcats');
    let imagesCount = 0;
    try {
        var Objectlist = await bucket.getList();
        let getImageProcess = [], rawData = [];
        imagesCount = Objectlist.KeyCount ? Objectlist.KeyCount : imageCount;
        for (var item of Objectlist.Contents) {
            rawData.push({key: _removeFolderName(item.Key, bucket.folderName)});
            getImageProcess.push(await bucket.getObjectByKey(item.Key));
        }
        
        for (var index in getImageProcess) {
            rawData[index]["rawData"] = new Buffer(getImageProcess[index].Body).toString('base64');
        }

        res.send({success : true, count: imagesCount, rawData: rawData});
    } catch (err) {
        console.log(err);
        return next(err);
    }
});

router.post("/uploadImages", (req, res) => {
    let data = {
        buffer: req.files.file.data,
        name: req.files.file.name
    };
    let bucket = new Bucket();
    bucket.uploadFile(data).then((response) =>{
        res.send({success: true, response: response});
    }).catch((err) => {
        next(err);
    });
});

router.delete("/deleteFile/:key", async (req, res) => {
    let bucket = new Bucket();
    try {
        let response = await bucket.removeFile(req.params.key)
        res.send({success: true, message: response});
    } catch (err) {
        next(err);
    }
});

function _removeFolderName(key, folderName = 'dualcats') {
    return key.replace(`${folderName}/`, "");
}

module.exports = router;