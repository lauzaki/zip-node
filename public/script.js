const form = document.getElementById("form");
const downloadBtn = document.getElementById("downloadBtn");
const processing = document.getElementById("processing");
const socketId = document.getElementById("socketId");
const menu = document.getElementById("menu");
const zipAgainBtn = document.getElementById("zipAgainBtn");


form.addEventListener("submit", submitForm);
downloadBtn.addEventListener("click", download);
zipAgainBtn.addEventListener("click", refleshPage);

let sessionId;

var socket = io.connect();
socket.onAny((event, ...args) => {
    switch (args[0]){
        case 'Zip_Ready':
            displayDownload();
        break;
        case 'Done':
            menu.style.display = "block";
        break;
        default:
            sessionId = args[0];
            socketId.value = sessionId;
  }});

/// submit files
function submitForm(e) {
    e.preventDefault();
    form.style.display = "none";
    processing.style.display = "block";
    const cover = document.getElementById("cover");
    const music = document.getElementById("music");

    const formData = new FormData();
    formData.append("cover", cover.files[0], 'cover.jpg');
    formData.append("music", music.files[0], 'music.mp3');
    formData.append("socketid", socketId);
    fetch("/upload", {
        method: 'post',
        body: formData,
        headers: {
            'SocketId': sessionId
          },
    })
        .catch((err) => ("Error occured", err));
}

//display download btn

function displayDownload (){
    downloadBtn.style.display = 'block';
    processing.style.display = "none";
}

//download zip
function download() {
  downloadBtn.style.display = 'none';
  
  const options = {
    method: 'get',
    headers: {
        'SocketId': sessionId,
        'Content-Type': 'application/zip'
      }
  };
   fetch("/download", options)
    .then( res => res.blob() )
    .then( zip => {
        let file = new File([zip], 'fileName', {type: "application/zip"});
        let exportUrl = URL.createObjectURL(file);
      
        window.location.assign(exportUrl);
        URL.revokeObjectURL(exportUrl);
    });
   
}

//reflesh page for new zip

function refleshPage(){
    location.reload();

}
