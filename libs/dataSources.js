const aws = require('aws-sdk');
const Q   = require('q');
/** Enviroment variable */
const BUCKET_NAME = process.env.AWS_S3BUCKET_NAME;
const IAM_USER_KEY = process.env.AWS_ACCESS__KEY_ID;
const IAM_USER_SECRET = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_REGION = process.env.AWS_REGION;

/** AWS Bucket auth config Set Up */
aws.config.setPromisesDependency();
aws.config.update({ accessKeyId: IAM_USER_KEY, secretAccessKey: IAM_USER_SECRET, region: AWS_REGION });

const AwsBucket = function () {
    this.s3 = new aws.S3();
};

AwsBucket.prototype.getObjectList = async function (folderName = "dualcats") {
    try {
        const response = await this.s3.listObjectsV2({
            Bucket: BUCKET_NAME,
            Prefix: folderName
        }).promise();
        return response;
    } catch (err) {
        throw new Error("Fail to get data from S3 bucket.", err);
    }
}

AwsBucket.prototype.getObjectRawDataByKey = async function (key) {
    if (!key) throw new Error("Missing Key.");
    try {
        let rawData = await this.s3.getObject({
            Bucket: BUCKET_NAME,
            Key: key
        }).promise();
        return rawData;
    } catch (err) {
        throw new Error(`Fail to get data by key ${key}`, err);
    }
}

AwsBucket.prototype.uploadFile = function (file, folder='dualcats') {
    let deferred = Q.defer();
    let params = {
        Bucket: BUCKET_NAME,
        Key: `${folder}/${file.name}`,
        Body: file.buffer
      };
    this.s3.upload(params, (err, data) => {
        if (err) {
            deferred.reject("Error in call back");
        } else {
            deferred.resolve({key: _removeFolderName(data.key)});
        }
    });

    return deferred.promise;
}

AwsBucket.prototype.removeFile = async function (file, folder='dualcats') {
    var params = {  Bucket: BUCKET_NAME, Key: `${folder}/${file}` };

    await this.s3.deleteObject(params, function(err, data) {
        if (err) {
            throw new Error("Fail to remove the file");
        } else {
            return "Remove a file."
        }
    });
}

/**
 * @param folderName
 */
AwsBucket.prototype.getObjectRawData = async function (folderName = "dualcats") {
    let deferred = Q.defer();
    if (!folderName) {
        deferred.reject("Missing folder name.");
        return;
    }
    const response = await this.s3.listObjectsV2({
            Bucket: BUCKET_NAME,
            Prefix: folderName
        }).promise();
    
    let getImageProcess = [], data = [];;
    for (var i = 1; i < response.Contents.length; i++) {
        data.push({key: _removeFolderName(response.Contents[i].Key, 'dualcats')});
        getImageProcess.push(this.s3.getObject({
            Bucket: BUCKET_NAME,
            Key: response.Contents[i].Key
        }).promise());
    }
    Q.all(getImageProcess)
        .then(imageObject => {
            for (var index in imageObject) {
                data[index]["rawData"] = new Buffer(imageObject[index].Body).toString('base64');
            }
            deferred.resolve(data);
        }).catch(err => {
            deferred.reject(err);
        });
    return deferred.promise;
};

function _removeFolderName(key, folderName = 'dualcats') {
    return key.replace(`${folderName}/`, "");
}

module.exports = {
    AwsBucket: AwsBucket
};