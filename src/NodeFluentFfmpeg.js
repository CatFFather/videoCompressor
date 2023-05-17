import React, { useRef, useState } from 'react';

export default function NodeFluentFfmpeg() {
  const [videoSrc, setVideoSrc] = useState(null);
  const [size, setSize] = useState(null);
  const [resolution, setResolution] = useState('854x480');

  const compressFile = async (e) => {
    console.time('video');
    const file = e.target?.files[0];
    const formData = new FormData();
    formData.append('file', file);
    try {
      //이미지 업로드
      const { url, fileName, originalName } = await fetch(
        'http://localhost:8080/api/file-upload',
        {
          method: 'POST',
          body: formData,
        },
      ).then((res) => res.json());
      console.log(fileName);
      if (!url) return;
      const readFile = await fetch(`http://localhost:8080/api/file-compress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          fileName,
          resolution,
        }),
      }).then((res) => res.json());

      const data = readFile.file.data;
      const uint8 = new Uint8Array(data);
      const newFile = new File([uint8], originalName, {
        type: 'video/mp4',
      });
      setSize(bytesToSize(newFile.size));
      const objUrl = URL.createObjectURL(newFile);
      console.timeEnd('video');
      setVideoSrc(objUrl);
    } catch (e) {
      console.log('fetch error', e);
    }
  };

  function bytesToSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return 'n/a';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
    if (i === 0) return `${bytes} ${sizes[i]})`;
    return `${(bytes / 1024 ** i).toFixed(1)} ${sizes[i]}`;
  }

  function onCheckboxClick(e) {
    setResolution(e.target.value);
  }

  return (
    <div>
      <div>
        <label>
          <input
            type="radio"
            name="radio"
            value="640x360"
            style={{ width: '20px', height: '20px' }}
            defaultChecked={true}
            onChange={onCheckboxClick}
          />
          640x360
        </label>
        <label>
          <input
            type="radio"
            name="radio"
            value="854x480"
            style={{ width: '20px', height: '20px' }}
            onChange={onCheckboxClick}
          />
          854x480
        </label>
        <label>
          <input
            type="radio"
            name="radio"
            value="1280x720"
            style={{ width: '20px', height: '20px' }}
            onChange={onCheckboxClick}
          />
          1280x720
        </label>
        <label>
          <input
            type="radio"
            name="radio"
            value="1920x1080"
            style={{ width: '20px', height: '20px' }}
            onChange={onCheckboxClick}
          />{' '}
          1920x1080
        </label>

        <form method="post" encType="multipart/form-data">
          <input
            type="file"
            onChange={compressFile}
            name="upload_video"
          ></input>
        </form>
        <div>
          {videoSrc && <p> (640x360) 사이즈 : {size}</p>}
          <video src={videoSrc} controls />
        </div>
      </div>
    </div>
  );
}
