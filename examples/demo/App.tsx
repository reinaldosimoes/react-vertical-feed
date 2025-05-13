import React, { useState } from 'react';
import { VerticalFeed, type VideoItem } from '../../src/VerticalFeed';
import { Heart } from 'lucide-react';

const App = (): React.ReactElement => {
  const [videoStates, setVideoStates] = useState<
    Record<number, { liked: boolean; animating: boolean }>
  >({});

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

  const toggleLike = (index: number) => {
    setVideoStates(prev => ({
      ...prev,
      [index]: {
        liked: !prev[index]?.liked,
        animating: true,
      },
    }));

    // Remove animation after it completes
    setTimeout(() => {
      setVideoStates(prev => ({
        ...prev,
        [index]: {
          ...prev[index],
          animating: false,
        },
      }));
    }, 300);
  };

  const renderVideoOverlay = (item: VideoItem, index: number): React.ReactNode => {
    const { liked = false, animating = false } = videoStates[index] || {};

    return (
      <div
        style={{
          position: 'absolute',
          right: '20px',
          bottom: '100px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          zIndex: 10,
        }}
      >
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.5)',
            borderRadius: '12px',
            padding: '8px',
            backdropFilter: 'blur(4px)',
          }}
        >
          <button
            onClick={e => {
              e.stopPropagation();
              toggleLike(index);
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              transform: animating ? 'scale(1.3)' : 'scale(1)',
              transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            }}
          >
            <Heart
              size={32}
              fill={liked ? '#ff2d55' : 'none'}
              color={liked ? '#ff2d55' : 'white'}
            />
            <span style={{ color: 'white', fontSize: '14px' }}>{liked ? 'Liked' : 'Like'}</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ height: '100vh', width: '100vw', backgroundColor: '#000' }}>
      <VerticalFeed
        items={videos}
        onEndReached={handleEndReached}
        onItemVisible={handleItemVisible}
        onItemHidden={handleItemHidden}
        style={{ height: '100%' }}
        renderItemOverlay={renderVideoOverlay}
      />
    </div>
  );
};

export default App;
