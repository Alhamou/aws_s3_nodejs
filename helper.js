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
                Key: "template_1/" + fileName,
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
    obj.sendImages = function(i, px){


        let size = imageSize(i.path).width > px || imageSize(i.path).height > px ? px : null; 

        return new Promise(function(resolve, reject){

            sharp(i.path)
                .resize(size)
                .toFile( "upload/" + i.name , async (err, info) => {
                    if (err) {
                        reject(err)
                        
                    }

                    const awsResponse = await obj.uplaod("upload/" + i.name, i.name)


                    resolve(awsResponse)

                    fs.unlinkSync(i.path)

                    
                });

        });

    }


    /**
     * formating name image.
     * @param {source Name} name 
     */
    obj.fileName = function(name){
        return Date.now() + "_" + encodeURIComponent(name.replace(/&. *;+/gm, '_').replace(/-/gm, '_'));
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
    return obj;
})()

