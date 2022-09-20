var AWS = require('aws-sdk');
var fs = require('fs');
var s3up = require('@aws-sdk/client-s3');
var clientUpload = require('@aws-sdk/lib-storage');



exports.handler = async function(event, context, callback) {
    await Promise.all(event.Records.map(async function(record){

        console.log('WE ENTERED');
        const s3 = new AWS.S3({ apiVersion: '2006-03-01' });
        console.log('s3 created');
        const accessKeyId = 'AKIA25GIFLL5HCEOCJUA';
        const secretAccessKey = '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';

        let pathName = '';
        let inputText = '';
        
        if(typeof(record.dynamodb.NewImage) !== 'undefined' && record.dynamodb.NewImage){
            if(typeof(record.dynamodb.NewImage.input_file_path) !== 'undefined' && record.dynamodb.NewImage.input_file_path){
                pathName = record.dynamodb.NewImage.input_file_path.S;
                inputText = record.dynamodb.NewImage.input_text.S;
            }
        }
        else if(typeof(record.dynamodb.OldImage) !== 'undefined' && record.dynamodb.OldImage){
                if(typeof(record.dynamodb.OldImage.input_file_path) !== 'undefined' && record.dynamodb.OldImage.input_file_path){
                    pathName = record.dynamodb.OldImage.input_file_path.S;
                    inputText = record.dynamodb.OldImage.input_text.S;
                }
        }
        else{
            throw new Error("Undefined text");
        }
        console.log(pathName)
        const length = pathName.length;
    
        const bucket = pathName.substring(0, 21);
        const fileName = pathName.substring(22, length);
        console.log(fileName);
        const params = {
            Bucket: bucket,
            Key: fileName,
        };

       
        try{
            const file = await s3.getObject(params).promise();
            console.log(`file: [${JSON.stringify(file)}]`);
            
            let body = file.Body;
            console.log(`type of body: [${typeof(body)}] body: [${body}]`);

            body += inputText;
            
            const target = { Bucket:bucket, Key:'output.txt', Body:body };
            const creds = { accessKeyId: accessKeyId, secretAccessKey: secretAccessKey};
                    
            const parallelUploads3 = new clientUpload.Upload({
                client: new s3up.S3Client({region: 'us-west-1', credential: creds}),
                    leavePartsOnError: false,
                    params: target,
            });

            parallelUploads3.on("httpUploadProgress", (progress) => {
                console.log(progress);
            });

            return parallelUploads3.done();
        }
        catch (e) {
            console.error(`error caught: [${JSON.stringify(e)}]`);
            throw e;
        }
    }));
    const response = {
        statusCode: 200,
        body: JSON.stringify('Function Ran'),
    };
    return response;
};