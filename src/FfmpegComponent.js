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

  // console.log('loadable', loadable);

  // 파일 변경
  function onFileChange(e) {
    setVideoPgress(0);
    transcode(e);
  }
  async function transcode({ target: { files } }) {
    console.time(`${resolution} 파일 변환 시간은?`);
    const { name, size } = files[0];
    const ffmpeg = createFFmpeg({
      log: true,
    });
    const outputName = 'result.mp4';
    const encodingArgsArray =
      `-map 0:V? -map 0:a? -map 0:s? -c:a libfdk_aac -vbr 5 -c:s mov_text -c:V libx264 -x264-params threads=11 -preset ultrafast -crf 25 -s ${resolution} ${outputName}`.split(
        ' ',
      );
    // crf : 인코딩시 사용되는 품질 기준값 0~ 51 범위로 영상의 화질을 조절 0이 제일 높은 화질, 17,18이 영상의 화질과 비슷
    // preset : 한 프레임을 만드는 데에 얼마나 CPU 자원을 사용할지 (느려질수록 같은 비트레이트에서 더 나은 품질) (superfast, ultrafast 등등)
    const ffmpegArgs = [
      '-i',
      name,
      '-metadata',
      'encoded_by=av-converter.com',
      '-id3v2_version',
      '3',
      '-write_id3v1',
      'true',
      ...encodingArgsArray,
    ];

    console.log('files[0]', files[0]);
    console.log(`${resolution} bytesToSize`, bytesToSize(size));
    await ffmpeg.load();
    ffmpeg.setProgress(({ ratio }) =>
      setVideoPgress(ratio < 0 ? 0 : Math.floor(ratio * 100)),
    );
    ffmpeg.FS('writeFile', name, await fetchFile(files[0]));
    await ffmpeg.run(...ffmpegArgs);
    const data = ffmpeg.FS('readFile', `${outputName}`);
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
