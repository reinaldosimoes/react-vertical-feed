import { StrictMode, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { VerticalFeed, type VerticalFeedRef, type VideoItem } from '../../../src/VerticalFeed';

const items: VideoItem[] = ['clouds', 'wind', 'grasshopper'].map(id => ({
  id,
  src: `${import.meta.env.BASE_URL}videos/${id}.mp4`,
  autoPlay: false,
  muted: true,
  playsInline: true,
  preload: 'none',
}));

const ScrollTestApp = (): React.ReactElement => {
  const feedRef = useRef<VerticalFeedRef>(null);
  const [allowPageChaining, setAllowPageChaining] = useState(
    () => new URLSearchParams(window.location.search).get('chain') === 'auto'
  );

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: '12px 12px auto auto',
          zIndex: 10,
          display: 'flex',
          gap: 8,
        }}
      >
        <button id="scroll-to-last" type="button" onClick={() => feedRef.current?.scrollToItem(2)}>
          Scroll to last item
        </button>
        <button
          id="toggle-page-chaining"
          type="button"
          onClick={() => setAllowPageChaining(value => !value)}
        >
          {allowPageChaining ? 'Contain page scroll' : 'Allow page scroll'}
        </button>
      </div>
      <div style={{ height: 600, padding: 24 }}>Page content before the feed</div>
      <VerticalFeed
        ref={feedRef}
        items={items}
        scrollBehavior="auto"
        style={{
          width: 320,
          height: 320,
          marginInline: 'auto',
          border: '4px solid #ff0050',
          ...(allowPageChaining ? { overscrollBehaviorY: 'auto' } : {}),
        }}
      />
      <div style={{ height: 1200, padding: 24 }}>Page content after the feed</div>
    </>
  );
};

document.body.style.margin = '0';
document.body.style.background = '#111';
document.body.style.color = '#fff';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ScrollTestApp />
  </StrictMode>
);
