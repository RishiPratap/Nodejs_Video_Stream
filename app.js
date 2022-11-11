const express = require('express');
const fs = require('fs');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const port = process.env.PORT || 8000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    app.use(express.static("./"));
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.get("/video",  function(req,res){
    const range = req.headers.range;
    if(!range){
    res.status(400).send("Request does not contain a range header");
    }
    const videoPath = "video.mp4";
    const videoSize = fs.statSync("video.mp4").size;

    const CHUNK_SIZE = 10 ** 4; // 1MB
    const start = Number(range?.replace(/\D/g, ""));
    const end = Math.min(start+CHUNK_SIZE,videoSize-1);

    const contentLength = end - start + 1;
    const headers  = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4",
    };
    res.writeHead(206, headers);

    const videoStream = fs.createReadStream(videoPath, {start, end});

    videoStream.pipe(res);
})

app.listen(port, () => {
    console.log('Server started on port 8000');
});