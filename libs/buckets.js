/** dependencies */
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

/** Bucket Class
 *          provide method for do actions on s3 buckets
 */
class Bucket {
    constructor(folderName = 'dualcats') {
        this.s3 = new aws.S3();
        this.folderName = folderName;
    }

    /**
     * @description retrieve all list from the s3 folder
     * @return {Promise}
     */
    async getList() {
        try {
            const response = await this.s3.listObjectsV2({
                Bucket: BUCKET_NAME,
                Prefix: this.folderName
            }).promise();
            // remove the first file from index 0
            response.Contents.shift();
            response.KeyCount -= 1;
            return response;
        } catch (err) {
            console.log(err);
            throw new Error("Fail to get data from S3 bucket.", err);
        }
    }

    /**
     * @description retrieve image item from folder by key
     * @return {Promise}
     */
    async getObjectByKey(key) {
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

    /**
     * @param {Object} file file contains file buffer and name
     * @return {Promise|Resolve|Reject|} return a promise string
     */
    uploadFile(file) {
        let deferred = Q.defer();
        let params = {
            Bucket: BUCKET_NAME,
            Key: `${this.folderName}/${file.name}`,
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


    uploadFiles() {
        // todo
    }

    /**
     * @param {string} fileName file key
     * @return {Promise|Resolve|Reject|} return a promise string
     */
    removeFile(fileName) {
        let deferred = Q.defer();
        var params = {  Bucket: BUCKET_NAME, Key: `${this.folderName}/${fileName}` };
        this.s3.deleteObject(params, (err, data) => {
            if (err) {
                deferred.reject("Fail to remove the file");
            } else {
                deferred.resolve(`File ${fileName} removed.`);
            }
        });
        return deferred.promise;
    }
}

function _removeFolderName(key, folderName = 'dualcats') {
    return key.replace(`${folderName}/`, "");
}

module.exports = {
    Bucket: Bucket
};