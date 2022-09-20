import React , {useState} from 'react';
import { Upload } from '@aws-sdk/lib-storage';
import { S3Client, S3 } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';


const S3_BUCKET ='filebucketjoshrussell';
const REGION ='us-west-1';
//IAM access keys
const accessKeyId = 'AKIA25GIFLL5HCEOCJUA';
const secretAccessKey = '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';

const UploadFileToS3 = () => {


   const [data,setData]=useState(null);


    function getData(event){
        setData(event.target.value);
        console.log(data);
    }


    function uploadFile(event) {

        const file = event.target.files[0];
        const target = { Bucket:S3_BUCKET, Key:file.name, Body:file };
        const creds = {accessKeyId: accessKeyId, secretAccessKey: secretAccessKey}

        try{

            const parallelUploads3 = new Upload({
                client: new S3Client({region: REGION, credentials:creds}),
                leavePartsOnError: false,
                params: target,
            });

            parallelUploads3.on("httpUploadProgress", (progress) => {
                console.log(progress);
            });

            parallelUploads3.done();

        } catch (e) {
            console.log(e);
        }



        //api call here with string
        const inputText = data;
        const filePath = "filebucketjoshrussell/" + file.name;
        const id = uuidv4();

        var body = {
            "operation": "create",
            "tableName": "lambda-apigateway",
            "payload": {
                "Item": {
                    "id": id,
                    "input_text": inputText,
                    "input_file_path": filePath
                }
            }
        };
        
        const api = 'https://rmhyfqwhec.execute-api.us-west-1.amazonaws.com/prod';
        axios.post(api, body)
            .then((response) => {
                console.log(response);
            })
            .catch((error) => {
                console.log(error);
            });
            
    };



    return( <div>
        <h1 className='ml-8'>Text Input:  
                    <input 
                        className='bg-black border my-4'
                        type="text" 
                        autoComplete='off'
                        name="itext"
                        onChange={getData}
                     />
        </h1>
        <h1 className='ml-8'> File Input: 
         <input type="file" onChange={uploadFile}/>
            <div></div><button className='border my-4' onClick={() => uploadFile}> Submit</button>
        </h1>
    </div>
    )
}

export default UploadFileToS3;