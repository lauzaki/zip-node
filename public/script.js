const form = document.getElementById("form");
const downloadBtn = document.getElementById("downloadBtn");
const processing = document.getElementById("processing");
const source = new EventSource('/events');

form.addEventListener("submit", submitForm);
downloadBtn.addEventListener("click", download);

 /*source.onmessage = function (e) {
    console.log(e.data);
    // when e.data == true, the zip is ready to be downloaded. Display the download button
   (switch (e.data){
        case 'displayForm':
            downloadBtn.style.display = 'none';
            processing.style.display = 'none';
            form.style.display = 'block';
            break;
        case 'processing':
            downloadBtn.style.display = 'none';
            processing.style.display = 'block';
            form.style.display = 'none';
            break;
        case 'zipReady':
            downloadBtn.style.display = 'block';
            processing.style.display = 'none';
            form.style.display = 'none';
            break;
    }
}*/


/// submit files
function submitForm(e) {
    e.preventDefault();
    form.style.display = "none";
    //processing.style.display = "block";
    downloadBtn.style.display = 'block';
    const cover = document.getElementById("cover");
    const music = document.getElementById("music");
    const formData = new FormData();
    formData.append("cover", cover.files[0], 'cover.jpg');
    formData.append("music", music.files[0], 'music.mp3');
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