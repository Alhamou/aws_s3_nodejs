const express = require("express");
const AWSAPI = require("./helper");

const app = express();
const formidable = require("formidable");






app.post("/",  function(req,res){


    const form = formidable({ multiples: true, uploadDir : 'upload/'});
         

    let files = [];
    const aws_images_url = [];

    form.on("fileBegin", function(name, file) {
                
        let local_name = AWSAPI.date() + "_rand_" + "_" + file.name;

        files.push({ path: file.path, name : local_name});

    });



    form.on("end", async function() {

        
        for(let i of files){
        

            try{

                const sendImages = await AWSAPI.sendImages(i, 900)

                aws_images_url.push(sendImages)

                
            } catch (error) {
                
                return res.send({ status: 'error', message : error});

            }
            
                
        } 
        
        res.json(aws_images_url);
        
        
    })

    form.parse(req);


    
})

app.listen(8081, function(){
    console.log("NODE IS RUNNING!")
})