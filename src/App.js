import React from 'react';
import './App.css';
import FfmpegComponent from './FfmpegComponent';
// import MuxjsComponent from './MuxjsComponent';
function App() {
  return (
    <>
      <div className="App">
        <h1>FfmpegComponent</h1>
        <FfmpegComponent resolution="1920x1080" />
        <FfmpegComponent resolution="1280x720" />
        <FfmpegComponent resolution="854x480" />
        <FfmpegComponent resolution="640x360" />
      </div>
      <div className="App">
        <h1>MuxjsComponent</h1>
        {/* <MuxjsComponent resolution="1920x1080" /> */}
      </div>
    </>
  );
}

export default App;
