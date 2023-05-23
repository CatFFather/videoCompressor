const express = require('express');
const multer = require('multer');
const router = express.Router();
const fs = require('fs');
const fluentFfmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffprobePath = require('@ffprobe-installer/ffprobe').path;
const multer = require('multer');
const { Stream } = require('stream');
fluentFfmpeg.setFfmpegPath(ffmpegPath);
fluentFfmpeg.setFfprobePath(ffprobePath);

//업로드 파일 저장경로
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

router.post('/upload', function (req, res) {
  try {
    videoUpload(req, res, (error) => {
      if (error) return res.json({ success: false, error });
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

router.put('/video-compress', async function (req, res) {
  const { url, fileName, resolution } = req.body;
  if (!(url && fileName && resolution))
    return res.json({ success: false, error: 'wrong body value' });
  const convertsUrl = 'uploads/converts/' + fileName;
  //완료된 파일들은 리소스 낭비하지않기위해 삭제
  const deleteVideo = () => {
    fs.unlink(url, (err) => {
      if (err) console.log(url + ' unlink err', err);
    });
    fs.unlink(convertsUrl, (err) => {
      if (err) console.log(convertsUrl + ' unlink err', err);
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

const memoryUpload = multer({ storage: multer.memoryStorage() });
router.put(
  '/api/video-compress/V2',
  memoryUpload.single('file'),
  (req, res) => {
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
  },
);

module.exports = router;
