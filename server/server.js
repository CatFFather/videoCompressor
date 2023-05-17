const express = require('express');
const app = express();
const fs = require('fs');
const router = express.Router();
const cors = require('cors');
const multer = require('multer');
const fluentFfmpeg = require('fluent-ffmpeg');
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
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const videoUpload = multer({
  dest: 'uploads/videos',
}).single('file');

app.put(
  '/api/file-compress',
  // videoUpload.single('upload_video'),
  async function (req, res) {
    const { url, fileName, resolution } = req.body;
    const convertsUrl = 'uploads/converts/' + fileName + '.mp4';
    //완료된 파일들은 리소스 낭비하지않기위해 삭제
    const deleteVideo = () => {
      fs.stat(url, (err) => {
        if (!err)
          fs.unlink(url, (err) => {
            if (err) console.log(url + 'unlink err');
          });
      });
      fs.stat(convertsUrl, (err) => {
        if (!err)
          fs.unlink(convertsUrl, (err) => {
            if (err) console.log(convertsUrl + 'unlink err');
          });
      });
    };

    fluentFfmpeg()
      .input(url)
      .size(resolution)
      .format('mp4')
      .save(convertsUrl)
      .on('end', (e) => {
        const readFile = fs.readFileSync(convertsUrl, null);
        //변환한 완료된 파일은 response 후 삭제함
        deleteVideo();
        res.json({ success: true, file: readFile });
      })
      .on('error', (e) => {
        console.log('ffmpeg error', e);
        deleteVideo();
        res.json({ success: false, error: e });
      });
  },
);

app.post('/api/file-upload', async function (req, res) {
  videoUpload(req, res, (err) => {
    if (err) return res.json({ success: false, err });
    return res.json({
      success: true,
      url: res.req.file.path,
      originalName: res.req.file.originalname,
      fileName: res.req.file.filename,
    });
  });
});

const PORT = 8080;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
