const path = require('path');
const multer = require("multer");
const fs = require('fs');
const archiver = require('archiver');

// express middlewares
function setStateProcessing(req, res, next){  
    next();
}

//multer setup
const imageStorage = multer.diskStorage({
  destination: 'uploads',
  filename: (req, file, cb) => {
    const id = req.headers.socketid;
    let fileName = file.fieldname + '_' + id+ path.extname(file.originalname);
    cb(null, fileName)
  }
});

//multer middleware
const upload = multer({
  storage: imageStorage,
  limits: {
    fileSize: 30000000 // 1000000 Bytes = 1 MB
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

//last middleware of the /upload route (user submit form): zip the files https://www.npmjs.com/package/archiver
function uploadFiles(req, res) {

  const id = req.headers.socketid;
  const output = fs.createWriteStream(__dirname + '/uploads/'+ id +'.zip');

  let archive = archiver('zip', { zlib: { level: 9 } });
  output.on('close', function () {
    //the zip is ready to be downloaded
    io.to(id).emit('event','Zip_Ready');
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

  // Create zip 
  const file1 = __dirname + '/uploads/cover_' + id + '.jpg';
  const file2 = __dirname + '/uploads/music_' + id + '.mp3';
  const file3 = __dirname + '/public/template.html';

  archive.append(fs.createReadStream(file1), { name: 'cover.jpg' });
  archive.append(fs.createReadStream(file2), { name: 'music.mp3' });
  archive.append(fs.createReadStream(file3), { name: 'index.html' });
  archive.finalize();
}

//middleware for /download route (user clicks download btn to get the zip file)
function downloadFile(req, res) {
  //user clicked the download button
  const id = req.headers.socketid;
  let file = `${__dirname}/uploads/${id}.zip`
  res.download(file, 'file-to-mint.zip', function(err){

    if (err) {
      console.log(err);
    } else {
      deleteDoneFiles(id);
    }
  
  });
}

//delete done files

function deleteDoneFiles (id){
  let p = __dirname + '/uploads/';
  fs.unlink(p + id+'.zip', unlinkCb);
  fs.unlink(p + 'music_'+id+'.mp3', unlinkCb);
  fs.unlink(p + 'cover_'+id+'.jpg', unlinkCb);

  //tell the browser we are done
  io.to(id).emit('event','Done');
}

function unlinkCb(e){
  //console.log(e);
}

// Initialisa express and socket.io
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static(__dirname + '/public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', (socket) => {
  console.log('a user connected   '+ socket.id);
  let socketId = socket.id;
  socket.emit('socketId', socketId);
  socket.on('disconnect', () => {
    console.log('disconnect  '+ socketId);
    deleteDoneFiles(socketId);
  });
});



app.post("/upload", setStateProcessing, upload.fields([{ name: 'music', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), uploadFiles);
app.get("/download", downloadFile);

server.listen(3000, () => {
  console.log(`Server started...`);
});