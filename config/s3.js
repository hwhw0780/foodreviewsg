const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const bucket = process.env.AWS_BUCKET_NAME;

async function uploadToS3(file, folder = '') {
    const params = {
        Bucket: bucket,
        Key: `${folder}/${Date.now()}-${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read'
    };

    try {
        const data = await s3.upload(params).promise();
        return data.Location;
    } catch (error) {
        console.error('Error uploading to S3:', error);
        throw error;
    }
}

async function deleteFromS3(key) {
    const params = {
        Bucket: bucket,
        Key: key
    };

    try {
        await s3.deleteObject(params).promise();
    } catch (error) {
        console.error('Error deleting from S3:', error);
        throw error;
    }
}

module.exports = { uploadToS3, deleteFromS3 }; 