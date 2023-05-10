import React, { useState } from 'react';
import './App.css';
import FfmpegComponent from './FfmpegComponent';
import BrowserImageComp from './BrowserImageComp';
// import MuxjsComponent from './MuxjsComponent';
function App() {
  const [page, setPage] = useState('FfmpegComponent');
  const onPageMove = (e) => {
    setPage(e?.target?.value);
  };
  return (
    <>
      <div style={{ textAlign: 'center' }}>
        <input
          type="button"
          value="FfmpegComponent"
          onClick={onPageMove}
        ></input>
        <input
          type="button"
          value="MuxjsComponent"
          onClick={onPageMove}
        ></input>
      </div>
      {page === 'FfmpegComponent' && (
        <>
          <div className="App">
            <h1>FfmpegComponent</h1>
            <FfmpegComponent resolution="1920x1080" />
            <FfmpegComponent resolution="1280x720" />
            <FfmpegComponent resolution="854x480" />
            <FfmpegComponent resolution="640x360" />
          </div>
        </>
      )}
      {page === 'MuxjsComponent' && (
        <div className="App">
          <h1>MuxjsComponent</h1>
          {/* <MuxjsComponent resolution="1920x1080" /> */}
        </div>
      )}
      {page === 'BrowserImageComp' && (
        <div className="App">
          <h1>BrowserImageComp</h1>
          <BrowserImageComp />
        </div>
      )}
    </>
  );
}

export default App;
