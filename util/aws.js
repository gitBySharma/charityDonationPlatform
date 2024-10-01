require('dotenv').config();

const AWS = require("aws-sdk");


const s3 = new AWS.S3({
    accessKeyId: process.env.IAM_USER_ACCESS_KEY,
    secretAccessKey: process.env.IAM_USER_SECRET,
    Bucket: "charityconnect"
});


const uploadToS3 = async (files) => {
    const uploadPromises = files.map(file => {
        const params = {
            Bucket: "charityconnect",
            Key: `Upload_${new Date().toISOString()}/${file.originalname}`,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'public-read'
        }

        return s3.upload(params).promise();
    });

    try {
        const uploadedFiles = await Promise.all(uploadPromises);  //wait for all the promises to resolve
        return uploadedFiles.map(uploadedFile => uploadedFile.Location);  //return array of uploaded urls

    } catch (error) {
        console.log("Error uploading to S3", error);
    }

};


module.exports = uploadToS3;