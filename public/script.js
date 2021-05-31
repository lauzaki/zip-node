const form = document.getElementById("form");
const downloadBtn = document.getElementById("downloadBtn")

form.addEventListener("submit", submitForm);
downloadBtn.addEventListener("click", download);

function download(e) {
    window.open("http://localhost:5000/download");
}


function submitForm(e) {
    e.preventDefault();
    const cover = document.getElementById("cover");
    const music = document.getElementById("music");
    const formData = new FormData();
    formData.append("cover", cover.files[0], 'cover.jpg');
    formData.append("music", music.files[0], 'music.mp3');
    fetch("http://localhost:5000/upload", {
        method: 'post',
        body: formData
    })
        .then((res) => console.log(res))
        .catch((err) => ("Error occured", err));
}

