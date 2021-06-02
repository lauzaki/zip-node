const form = document.getElementById("form");
const downloadBtn = document.getElementById("downloadBtn");
const processing = document.getElementById("processing");
const socketId = document.getElementById("socketId");


form.addEventListener("submit", submitForm);
downloadBtn.addEventListener("click", download);

let sessionId;

var socket = io.connect();
socket.onAny((event, ...args) => {
    sessionId = args[0];
    socketId.value = sessionId;
  });

/// submit files
function submitForm(e) {
    e.preventDefault();
    form.style.display = "none";
    //processing.style.display = "block";
    downloadBtn.style.display = 'block';
    const cover = document.getElementById("cover");
    const music = document.getElementById("music");
    const idBlob = new Blob([socketId.value], {
        type: 'text/plain'
    });

    const formData = new FormData();
    formData.append("cover", cover.files[0], 'cover.jpg');
    formData.append("music", music.files[0], 'music.mp3');
    formData.append("socketId", idBlob);
    fetch("/upload", {
        method: 'post',
        body: formData
    })
        .catch((err) => ("Error occured", err));
}

//download zip
function download(e) {
    downloadBtn.style.display = 'none';
    window.open("/download");
}