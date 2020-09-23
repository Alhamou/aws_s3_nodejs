const express = require("express");
const aws_controller = require("./aws_s3_helper");
const fs = require("fs");
const app = express();
const formidable = require("formidable");
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const archiver = require('archiver');





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





function zipDirectory(source, out) {

  const archive = archiver('zip', { zlib: { level: 9 }});
  const stream = fs.createWriteStream(out);

  return new Promise((resolve, reject) => {
    archive
      .directory(source, false)
      .on('error', err => reject(err))
      .pipe(stream)
    ;

    stream.on('close', () => resolve());
    archive.finalize();
  });
}


const dir = __dirname + "/dir"
const zip = __dirname + "/zip/test.zip"


async function serverFtp() {

    const zipFile = await zipDirectory(dir, zip);
    const {stderr, stdout} = await exec(`server.sh ${zip}`);
  
    console.error(stderr, stdout);

}
  
serverFtp()



app.get("sftp", function(req, res){


});

app.listen(8081, function(){
    console.log("NODE IS RUNNING!")
})