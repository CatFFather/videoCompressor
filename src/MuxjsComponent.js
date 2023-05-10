import React, { useState } from 'react';
import muxjs from 'mux.js';
import './App.css';

function bytesToSize(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return 'n/a';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
  if (i === 0) return `${bytes} ${sizes[i]})`;
  return `${(bytes / 1024 ** i).toFixed(1)} ${sizes[i]}`;
}

export default function MuxjsComponent(props) {
  const { resolution } = props;
  // const loadable = !!window.SharedArrayBuffer;
  const [videoSrc, setVideoSrc] = useState('');
  const [videoPgress, setVideoPgress] = useState(null);

  // console.log('loadable', loadable);

  // 파일 변경
  function onFileChange(e) {
    setVideoPgress(0);
    handleFileUpload(e);
  }

  const compressVideo = async (inputFile) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(inputFile);
    const result = await new Promise((resolve, reject) => {
      reader.onload = () => {
        const inputArray = new Uint8Array(reader.result);
        const transmuxer = new muxjs.mp4.Transmuxer();
        const outputData = [];

        transmuxer.on('data', (segment) => {
          outputData.push(segment.data);
        });

        transmuxer.on('done', () => {
          const outputArray = new Uint8Array(
            outputData.reduce((acc, data) => acc.concat(Array.from(data)), []),
          );
          const outputBlob = new Blob([outputArray], { type: 'video/mp4' });
          resolve(outputBlob);
        });

        transmuxer.on('error', (error) => {
          reject(error);
        });

        transmuxer.push(inputArray);
        transmuxer.flush();
      };
    });

    return result;
  };

  const handleFileUpload = async (event) => {
    const inputFile = event.target.files[0];
    console.log('inputFile', inputFile);
    const compressedVideo = await compressVideo(inputFile);
    console.log('compressedVideo', compressedVideo);

    const video = document.createElement('video');
    video.src = URL.createObjectURL(compressedVideo);
    video.addEventListener('loadedmetadata', () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 1280;
      canvas.height = 720;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        // 720p 크기로 압축된 비디오 데이터 blob을 처리하는 코드 작성
        console.log('blob', blob);
      }, 'video/mp4');
    });
  };

  // async function transcode({ target: { files } }) {
  //     console.time(`${resolution} 파일 변환 시간은?`);
  //     const { name, size } = files[0];
  //     console.log('files[0]', files[0]);
  //     console.log(`${resolution} bytesToSize`, bytesToSize(size));
  //     await ffmpeg.load();
  //     ffmpeg.setProgress(({ ratio }) => setVideoPgress(ratio < 0 ? 0 : Math.floor(ratio * 100)));
  //     ffmpeg.FS('writeFile', name, await fetchFile(files[0]));
  //     await ffmpeg.run('-i', name, '-s', resolution, `${name}.mp4`);
  //     // await ffmpeg.run('-i', name, `${name}.mp4`);
  //     const data = ffmpeg.FS('readFile', `${name}.mp4`);
  //     const newFile = new File([data.buffer], name, { type: 'video/mp4' });
  //     console.log('newFile', newFile);
  //     setVideoSrc(URL.createObjectURL(newFile));
  //     console.log(`${resolution} bytesToSize`, bytesToSize(newFile.size));
  //     console.timeEnd(`${resolution} 파일 변환 시간은?`);
  // }

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
