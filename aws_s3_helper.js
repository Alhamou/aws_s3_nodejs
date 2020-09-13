const AWS = require("aws-sdk");
const fs = require("fs");
const sharp = require("sharp");
require('dotenv').config()
const imageSize = require('image-size');
AWS.config.update({region: 'eu-central-1'});


module.exports =  (function(){

    const obj = {};

    const s3 = new AWS.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        apiVersion: '2006-03-01'
    });


    /**
     * uplaod images to AWS S3.
     * @param {path of local for all images} filePath 
     * @param {the name of evry image} fileName 
     */
    obj.uplaod = function (filePath, fileName) {

        return new Promise(function(resolve, reject){

            // Read content from the file
            const fileContent = fs.readFileSync(filePath);
    
            // Setting up S3 upload parameters
            const params = {
                Bucket: process.env.BUCKET,
                Key: "images_v1/" + fileName,
                Body: fileContent,
                ACL:'public-read',
                MaxItems: 10
            };
    
    
            // Uploading files to the bucket
            s3.upload(params, function(err, data) {
                if (err) {
                    reject(err)
                }
                
                
                resolve(data.Location)
            });
    
    
        })

    }


    /**
     * handeling uplaod to the local server
     * then resizing all images 
     * @param {Images} i 
     */
    obj.sendImages = function(file, px){

        
        let size = imageSize(file.path).width > px || imageSize(file.path).height > px ? px : null; 

        return new Promise(function(resolve, reject){

            sharp(file.path)
                .resize(size)
                .toFile( "upload/" + file.name , async (err, info) => {
                    if (err) {
                        reject(err)
                        
                    }

                    const awsResponse = await obj.uplaod("upload/" + file.name, file.name)


                    resolve(awsResponse)

                    fs.unlinkSync(file.path)

                    
                });

        });

    }


    /**
     * formating name image.
     * @param {source Name} name 
     */
    obj.fileName = function(name){
        return obj.date() + "_" + Date.now() + "_" + encodeURIComponent(name.replace(/&. *;+/gm, '_').replace(/-/gm, '_'));
    }

     /**
     * set Date as string yyyy-mm-dd.
     */
    obj.date = function(){
        var d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

        if (month.length < 2) 
            month = '0' + month;
        if (day.length < 2) 
            day = '0' + day;
            return [year, month, day].join('_');
    }



    obj.checkFileType = function(file){


        const type = file.type.split("/").pop();

        const validTypes = ["png", "jpeg", "gif", "jpg", "webp", "pdf"];

        if(validTypes.indexOf(type) == -1){
    
            console.log("The File type in invalid");
            
            console.log("The file upload faild, trying to remove the temp file..")

            // delete file that does not uploaded.
            try {fs.unlinkSync(file.path)} catch {console.log("can't delete the old file upload, after failed: " + file.path) }


            return false;
    
        }
    
        return true;


    }
    return obj;
})()

