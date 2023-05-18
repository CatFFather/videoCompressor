const express = require('express');
const app = express();
const fs = require('fs');
const cors = require('cors');
const multer = require('multer');
const fluentFfmpeg = require('fluent-ffmpeg');
const { Stream } = require('stream');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffprobePath = require('@ffprobe-installer/ffprobe').path;
fluentFfmpeg.setFfmpegPath(ffmpegPath);
fluentFfmpeg.setFfprobePath(ffprobePath);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

// app.use((_, res, next) => {
//   res.header('Cross-Origin-Opener-Policy', 'same-origin');
//   res.header('Cross-Origin-Embedder-Policy', 'require-corp');
//   next();
// });

app.use(express.static('build'));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/videos');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const videoUpload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, //업로드 용량 제한
}).single('file');

app.put('/api/file-compress', async function (req, res) {
  const { url, fileName, resolution } = req.body;
  const convertsUrl = 'uploads/converts/' + fileName;
  //완료된 파일들은 리소스 낭비하지않기위해 삭제
  const deleteVideo = () => {
    fs.unlink(url, (err) => {
      if (err) console.log(url + ' unlink err');
    });
    fs.unlink(convertsUrl, (err) => {
      if (err) console.log(convertsUrl + ' unlink err');
    });
  };
  try {
    fluentFfmpeg({ source: url })
      .size(resolution)
      .format('mp4')
      .output(convertsUrl)
      .on('end', async () => {
        const readFile = fs.readFileSync(convertsUrl, null);
        res.json({ success: true, file: readFile });
        //변환한 완료된 파일은 response 후 삭제함
        deleteVideo();
      })
      .on('error', (e) => {
        console.log('ffmpeg error', e);
        deleteVideo();
        res.json({ success: false, error: e });
      })
      .run();
  } catch (e) {
    console.log('server.js file-compress error', e);
    res.json({ success: false, error: e });
  }
});

app.post('/api/file-upload', function (req, res) {
  try {
    videoUpload(req, res, (err) => {
      if (err) return res.json({ success: false, err });
      return res.json({
        success: true,
        url: res.req.file.path,
        originalName: res.req.file.originalname,
        fileName: res.req.file.filename,
      });
    });
  } catch (e) {
    console.log('server.js file-upload error', e);
    res.json({ success: false, error: e });
  }
});

const memoryUpload = multer({ storage: multer.memoryStorage() });
app.put('/api/video-compress', memoryUpload.single('file'), (req, res) => {
  try {
    const file = req.file;
    const buffer = file.buffer;
    const { resolution } = req.query;
    const convertsUrl = 'uploads/converts/' + file.originalname;
    const ffmpeg = require('fluent-ffmpeg');
    const bufferStream = new Stream.PassThrough();
    // const readable = toStream(file.buffer);
    // console.log('read end');
    // const streamRead = Stream.Readable.from(req.file.buffer, {
    //   objectMode: false,
    // });
    const command = ffmpeg({
      source: Stream.Readable.from([Buffer.from(buffer, 'base64')], {
        objectMode: false,
      }),
    });
    command
      .size(resolution)
      .format('mp4')
      .writeToStream(bufferStream, { end: true })
      // .save(convertsUrl)
      .on('end', (err, stdout, stderr) => {
        console.log('video convert finished');
      });
  } catch (e) {
    res.json({ success: false, error: e });
  }
});

const PORT = 8080;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});

app.use((err, req, res, next) => {
  console.error(err.stock);
  res.status(500).send({ success: false, error: err });
});

process.on('uncaughtException', (err) => {
  console.log('uncaughtException', err);
});
