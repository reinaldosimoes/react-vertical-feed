# React Vertical Feed

[![npm](https://img.shields.io/badge/npm-react--vertical--feed-red)](https://www.npmjs.com/package/react-vertical-feed)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/react-vertical-feed)](https://bundlephobia.com/result?p=react-vertical-feed)
[![CI](https://github.com/reinaldosimoes/react-vertical-feed/actions/workflows/package.yml/badge.svg)](https://github.com/reinaldosimoes/react-vertical-feed/actions/workflows/package.yml)
[![Coverage](https://github.com/reinaldosimoes/react-vertical-feed/actions/workflows/coverage.yml/badge.svg)](https://github.com/reinaldosimoes/react-vertical-feed/actions/workflows/coverage.yml)

A React component for creating vertical video feeds similar to TikTok or Instagram. This component provides a smooth, performant way to display vertical videos with automatic play/pause based on visibility.

## Table of Contents

- [React Vertical Feed](#react-vertical-feed)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Demo](#demo)
  - [Installation](#installation)
  - [Usage](#usage)
  - [API Reference](#api-reference)
    - [Props](#props)
    - [Types](#types)
    - [Keyboard Navigation](#keyboard-navigation)
    - [Programmatic Control](#programmatic-control)
  - [Browser Compatibility](#browser-compatibility)
  - [Performance](#performance)
  - [Development](#development)
    - [Test Coverage](#test-coverage)
  - [License](#license)

## Features

- 🎥 Automatic video play/pause based on visibility
- ⌨️ Keyboard navigation support (Arrow keys, Space, Home, End)
- ♿️ Accessibility features
- 📱 Mobile-friendly
- 🎨 Customizable loading and error states
- 🔄 Video loop and poster image support
- ⚡️ Performance optimized with stable refs
- 📦 TypeScript support

## Demo

[Live Demo](https://reinaldosimoes.github.io/react-vertical-feed/)

<img src="./demo.gif" alt="React Vertical Feed Demo" width="300"/>

## Installation

```bash
npm install react-vertical-feed
# or
yarn add react-vertical-feed
```

## Usage

```tsx
import { VerticalFeed } from 'react-vertical-feed';
import { Heart } from 'lucide-react';

const App = () => {
  const [videoStates, setVideoStates] = useState<Record<number, { liked: boolean }>>({});

  const videos = [
    {
      src: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      controls: true,
      autoPlay: true,
      muted: true,
      playsInline: true,
    },
    // ... more videos
  ];

  const handleEndReached = () => {
    console.log('End reached');
  };

  const renderVideoOverlay = (item: VideoItem, index: number) => {
    const { liked = false } = videoStates[index] || {};

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
              setVideoStates(prev => ({
                ...prev,
                [index]: { liked: !prev[index]?.liked },
              }));
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
    <div className="w-full h-screen">
      <VerticalFeed
        items={videos}
        onEndReached={handleEndReached}
        className="h-full"
        renderItemOverlay={renderVideoOverlay}
      />
    </div>
  );
};
```

## API Reference

### Props

| Prop                  | Type                                                     | Default      | Description                                  |
| --------------------- | -------------------------------------------------------- | ------------ | -------------------------------------------- |
| `items`               | `VideoItem[]`                                            | **required** | Array of video items                         |
| `onEndReached`        | `() => void`                                             | -            | Callback when user scrolls to the end        |
| `loadingComponent`    | `React.ReactNode`                                        | -            | Custom loading component                     |
| `errorComponent`      | `React.ReactNode`                                        | -            | Custom error component                       |
| `className`           | `string`                                                 | -            | Additional CSS class                         |
| `style`               | `React.CSSProperties`                                    | -            | Additional CSS styles                        |
| `onItemVisible`       | `(item: VideoItem, index: number) => void`               | -            | Callback when item becomes visible           |
| `onItemHidden`        | `(item: VideoItem, index: number) => void`               | -            | Callback when item becomes hidden            |
| `onItemClick`         | `(item: VideoItem, index: number) => void`               | -            | Callback when item is clicked                |
| `threshold`           | `number`                                                 | `0.75`       | Intersection observer threshold              |
| `scrollBehavior`      | `ScrollBehavior`                                         | `'smooth'`   | Scroll behavior for keyboard navigation      |
| `renderItemOverlay`   | `(item: VideoItem, index: number) => React.ReactNode`    | -            | Custom overlay component for each item       |
| `endReachedThreshold` | `number`                                                 | `100`        | Distance from bottom to trigger onEndReached |
| `onVideoError`        | `(item: VideoItem, index: number, error: Error) => void` | -            | Callback when video playback fails           |
| `onCurrentItemChange` | `(index: number) => void`                                | -            | Callback when current visible item changes   |
| `defaultPreload`      | `'none' \| 'metadata' \| 'auto'`                         | `'metadata'` | Default preload strategy for videos          |

### Types

```typescript
interface VideoItem {
  src: string;
  id?: string;
  metadata?: Record<string, unknown>;
  controls?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  playsInline?: boolean;
  loop?: boolean;
  poster?: string;
  preload?: 'none' | 'metadata' | 'auto';
}

interface VerticalFeedRef {
  scrollToItem: (index: number, behavior?: ScrollBehavior) => void;
  getCurrentItem: () => number;
}
```

### Keyboard Navigation

| Key     | Action                   |
| ------- | ------------------------ |
| `↑`     | Scroll to previous video |
| `↓`     | Scroll to next video     |
| `Space` | Play/pause current video |
| `Home`  | Scroll to first video    |
| `End`   | Scroll to last video     |

### Programmatic Control

You can control the feed programmatically using a ref:

```tsx
import { useRef } from 'react';
import { VerticalFeed, VerticalFeedRef } from 'react-vertical-feed';

const App = () => {
  const feedRef = useRef<VerticalFeedRef>(null);

  const handleNext = () => {
    const current = feedRef.current?.getCurrentItem() ?? 0;
    feedRef.current?.scrollToItem(current + 1);
  };

  const handlePrev = () => {
    const current = feedRef.current?.getCurrentItem() ?? 0;
    feedRef.current?.scrollToItem(current - 1);
  };

  return (
    <>
      <VerticalFeed ref={feedRef} items={videos} />
      <button onClick={handlePrev}>Previous</button>
      <button onClick={handleNext}>Next</button>
    </>
  );
};
```

## Browser Compatibility

This package is compatible with all modern browsers that support:

- Intersection Observer API
- CSS Scroll Snap
- HTML5 Video

| Browser | Version |
| ------- | ------- |
| Chrome  | 51+     |
| Firefox | 55+     |
| Safari  | 12.1+   |
| Edge    | 16+     |
| Opera   | 38+     |

## Performance

The component is optimized for performance with:

- Lazy loading of videos
- Automatic cleanup of resources
- Efficient intersection observer usage
- Minimal re-renders
- Optimized scroll handling

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Format code
npm run format

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Test Coverage

Test coverage reports are generated for each pull request and can be found in the GitHub Actions artifacts. To view the coverage report:

1. Go to the latest workflow run
2. Click on the "coverage-report" artifact
3. Download and open the `index.html` file in your browser

## License

MIT © [reinaldosimoes](https://github.com/reinaldosimoes)
