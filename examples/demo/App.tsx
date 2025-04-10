import React from 'react';
import { VerticalFeed, type VideoItem } from 'react-vertical-feed';

const App = () => {
  const videos: VideoItem[] = [
    {
      src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      controls: true,
      autoPlay: true,
      muted: true,
      playsInline: true,
    },
    {
      src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      controls: true,
      autoPlay: true,
      muted: true,
      playsInline: true,
    },
    {
      src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      controls: true,
      autoPlay: true,
      muted: true,
      playsInline: true,
    },
  ];

  const handleEndReached = () => {
    console.log('End of feed reached');
  };

  const handleItemVisible = (item: VideoItem, index: number) => {
    console.log(`Item ${index} is now visible`);
  };

  const handleItemHidden = (item: VideoItem, index: number) => {
    console.log(`Item ${index} is now hidden`);
  };

  return (
    <div style={{ height: '100vh', width: '100vw', backgroundColor: '#000' }}>
      <VerticalFeed
        items={videos}
        onEndReached={handleEndReached}
        onItemVisible={handleItemVisible}
        onItemHidden={handleItemHidden}
        style={{ height: '100%' }}
      />
    </div>
  );
};

export default App;
