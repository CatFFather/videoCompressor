import React, { useRef, useState } from 'react';

export default function NodeFluentFfmpeg() {
  const [videoSrc, setVideoSrc] = useState(null);
  const [size, setSize] = useState(null);
  const [originalSize, setOriginalSize] = useState(null);
  const [time, setTime] = useState(null);
  const [resolution, setResolution] = useState('640x360');
  const inputRef = useRef();

  const compressFile = async (e) => {
    const startTime = Date.now();
    const file = e.target?.files[0];
    const formData = new FormData();
    formData.append('file', file);
    setOriginalSize(bytesToSize(file.size));
    try {
      //이미지 업로드
      const { url, fileName, originalName } = await fetch(
        'http://localhost:8080/api/file-upload',
        {
          method: 'POST',
          body: formData,
        },
      ).then((res) => res.json());
      if (!url) return;
      //파일 압축
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
      setVideoSrc(objUrl);
      //이미지 업로드 V2
      // const readFile = await fetch(
      //   `http://localhost:8080/api/video-compress?resolution=${resolution}`,
      //   {
      //     method: 'PUT',
      //     body: formData,
      //   },
      // );

      const endTime = (Date.now() - startTime) / 1000;
      setTime(endTime);
      inputRef.current.value = null;
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
    setSize(null);
    setOriginalSize(null);
    setTime(null);
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
            ref={inputRef}
            type="file"
            onChange={compressFile}
            name="upload_video"
          ></input>
        </form>
        <div>
          {originalSize && (
            <p>
              ({resolution}) 원본 사이즈 : {originalSize}
            </p>
          )}
          {size && (
            <p>
              ({resolution}) 사이즈 : {size}
            </p>
          )}
          {time && (
            <p>
              ({resolution}) 경과시간 : {time} 초
            </p>
          )}
          <video src={videoSrc} controls />
        </div>
      </div>
    </div>
  );
}
