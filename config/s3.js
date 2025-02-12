const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const bucket = process.env.AWS_BUCKET_NAME;

async function uploadToS3(file, folder = '') {
    const key = `${folder}/${Date.now()}-${file.originalname}`;
    const params = {
        Bucket: bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype
    };

    try {
        console.log('Uploading file to S3:', { bucket: params.Bucket, key: params.Key });
        const data = await s3.upload(params).promise();
        
        // Make the object public using putObjectAcl
        try {
            await s3.putObjectAcl({
                Bucket: bucket,
                Key: key,
                ACL: 'public-read'
            }).promise();
        } catch (aclError) {
            console.log('Note: Could not set ACL - this is expected if ACLs are disabled', aclError.message);
            // Continue even if ACL setting fails - we'll rely on bucket policy
        }

        console.log('File uploaded successfully:', data.Location);
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
        console.log('Deleting file from S3:', { bucket: params.Bucket, key: params.Key });
        await s3.deleteObject(params).promise();
        console.log('File deleted successfully');
    } catch (error) {
        console.error('Error deleting from S3:', error);
        throw error;
    }
}

module.exports = { uploadToS3, deleteFromS3 }; 