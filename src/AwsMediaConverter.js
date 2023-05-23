// import aws from 'aws-sdk';
import React from 'react';
export default function AwsMediaConverter() {
  //   const region = 'ap-northeast-2';
  //   const client = new MediaConvertClient({ region });
  //   aws.config.update({ region });
  const mediaConvert = (e) => {
    console.log(e);
    fetch(
      'https://qqbh0u4buc.execute-api.ap-northeast-2.amazonaws.com/default/VODmediaConvert',
    )
      .then((res) => res.json())
      .then((res) => console.log(res));
  };
  return (
    <div>
      ddddd
      <input type="button" onClick={mediaConvert} value="aws"></input>
    </div>
  );
}
