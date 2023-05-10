import React, { useState } from 'react';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import './App.css';

// const ffmpeg = createFFmpeg({
//     log: false,
// });
function bytesToSize(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return 'n/a';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
  if (i === 0) return `${bytes} ${sizes[i]})`;
  return `${(bytes / 1024 ** i).toFixed(1)} ${sizes[i]}`;
}

export default function FfmpegComponent(props) {
  const { resolution } = props;
  // const loadable = !!window.SharedArrayBuffer;
  const [videoSrc, setVideoSrc] = useState('');
  const [videoPgress, setVideoPgress] = useState(null);
  const [ffmpeg] = useState(
    createFFmpeg({
      log: false,
    }),
  );
  // console.log('loadable', loadable);

  // 파일 변경
  function onFileChange(e) {
    setVideoPgress(0);
    transcode(e);
  }
  async function transcode({ target: { files } }) {
    console.time(`${resolution} 파일 변환 시간은?`);
    const { name, size } = files[0];
    console.log('files[0]', files[0]);
    console.log(`${resolution} bytesToSize`, bytesToSize(size));
    await ffmpeg.load();
    ffmpeg.setProgress(({ ratio }) =>
      setVideoPgress(ratio < 0 ? 0 : Math.floor(ratio * 100)),
    );
    ffmpeg.FS('writeFile', name, await fetchFile(files[0]));
    await ffmpeg.run('-i', name, '-s', resolution, `${name}.mp4`);
    // await ffmpeg.run('-i', name, `${name}.mp4`);
    const data = ffmpeg.FS('readFile', `${name}.mp4`);
    const newFile = new File([data.buffer], name, { type: 'video/mp4' });
    console.log('newFile', newFile);
    setVideoSrc(URL.createObjectURL(newFile));
    console.log(`${resolution} bytesToSize`, bytesToSize(newFile.size));
    console.timeEnd(`${resolution} 파일 변환 시간은?`);
  }
  function inputDisabled() {
    return videoPgress && videoPgress < 100 ? true : false;
  }

  return (
    <div className="App">
      <h1>{resolution}</h1>
      <p />
      <video src={videoSrc} controls></video>
      <br />
      <p>
        <input
          type="file"
          accept="video/*"
          onChange={(e) => {
            e.persist();
            onFileChange(e);
          }}
          disabled={inputDisabled()}
        />
      </p>
      {videoPgress != null && (
        <p>
          진행율 : <progress max="100" value={videoPgress} /> {videoPgress}%
        </p>
      )}
    </div>
  );
}
