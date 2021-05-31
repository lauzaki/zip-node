const express = require("express");
const path = require('path');
const multer = require("multer");
const fs = require('fs');
const archiver = require('archiver');

let musicFileName, coverFileName;

const imageStorage = multer.diskStorage({
  destination: 'uploads',
  filename: (req, file, cb) => {
    let fileName = file.fieldname + '_' + Date.now() + path.extname(file.originalname);
    switch (file.fieldname) {
      case 'cover':
        coverFileName = fileName;
        break;
      case 'music':
        musicFileName = fileName;
        break;
      default:
        console.log("file name error");
    }
    cb(null, file.fieldname + '_' + Date.now()
      + path.extname(file.originalname))
  }
});

const upload = multer({
  storage: imageStorage,
  limits: {
    fileSize: 10000000 // 1000000 Bytes = 1 MB
    ,
    fileFilter(req, file, cb) {
      if (!file.originalname.match(/\.(png|jpg|mp3)$/)) {
        // upload only png and jpg format
        return cb(new Error('Please upload a Image'))
      }
      cb(undefined, true)
    }
  }
});

function uploadFiles(req, res) {

  const output = fs.createWriteStream(__dirname + '/uploads/music-to-mint.zip');

  let archive = archiver('zip', { zlib: { level: 9 } });
  output.on('close', function () {
    console.log(archive.pointer() + ' total bytes');
    console.log('archiver has been finalized and the output file descriptor has closed.');
  });

  // This event is fired when the data source is drained no matter what was the data source.
  // It is not part of this library but rather from the NodeJS Stream API.
  // @see: https://nodejs.org/api/stream.html#stream_event_end
  output.on('end', function () {
    console.log('Data has been drained');
  });

  // good practice to catch warnings (ie stat failures and other non-blocking errors)
  archive.on('warning', function (err) {
    if (err.code === 'ENOENT') {
      // log warning
    } else {
      // throw error
      throw err;
    }
  });

  // good practice to catch this error explicitly
  archive.on('error', function (err) {
    throw err;
  });

  // Send the file to the page output.
  archive.pipe(output);

  // Create zip with some files. Two dynamic, one static. Put #2 in a sub folder.
  //archive.file(coverFileName, { name: 'cover.jpg' })
  // .file(musicFileName, { name: 'music.mp3' })
  //.finalize();
  const file1 = __dirname + '/uploads/' + coverFileName;
  const file2 = __dirname + '/uploads/' + musicFileName;
  const file3 = __dirname + '/public/template.html';
  archive.append(fs.createReadStream(file1), { name: 'cover.jpg' });
  archive.append(fs.createReadStream(file2), { name: 'music.mp3' });
  archive.append(fs.createReadStream(file3), { name: 'index.html' });
}

function downloadFile(req, res) {
  let file = `${__dirname}//uploads/music-to-mint.zip`
  res.download(file);
}

const app = express();

app.use(express.static(__dirname + '/public'));

app.post("/upload", upload.fields([{ name: 'music', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), uploadFiles);
app.get("/download", downloadFile);


app.listen(5000, () => {
  console.log(`Server started...`);
});

