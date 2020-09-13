const express = require("express");
const aws_controller = require("./aws_s3_helper");
const fs = require("fs");
const app = express();
const formidable = require("formidable");






app.post("/",  function(req,res){


    const form = formidable({ multiples: true, uploadDir : 'upload/'});
         

    const files = [];
    const url_images = [];


    form.on("file", async function(name, file) {


        if(aws_controller.checkFileType(file)){
            let local_name = aws_controller.fileName(file.name);

            files.push({ path: file.path, name : local_name});
        }


    })

    form.on("end", async function() {

        try{

            for(let i of files){

                const sendImages = await aws_controller.sendImages(i, 900);

                url_images.push(sendImages);
                
            }

            res.json(url_images);
        } catch (error) {
            console.log(error);
            return res.send({ status: 'error', message : error});
        }
            
        
    })

    form.parse(req);


    
})

app.listen(8081, function(){
    console.log("NODE IS RUNNING!")
})