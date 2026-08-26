# React Vertical Feed

[![npm version](https://img.shields.io/npm/v/react-vertical-feed.svg)](https://www.npmjs.com/package/react-vertical-feed)
[![weekly downloads](https://img.shields.io/npm/dw/react-vertical-feed.svg)](https://www.npmjs.com/package/react-vertical-feed)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/react-vertical-feed)](https://bundlephobia.com/result?p=react-vertical-feed)
[![CI](https://github.com/reinaldosimoes/react-vertical-feed/actions/workflows/package.yml/badge.svg)](https://github.com/reinaldosimoes/react-vertical-feed/actions/workflows/package.yml)
[![Coverage](https://github.com/reinaldosimoes/react-vertical-feed/actions/workflows/coverage.yml/badge.svg)](https://github.com/reinaldosimoes/react-vertical-feed/actions/workflows/coverage.yml)

A React component for creating vertical video feeds similar to TikTok or Instagram. This component provides a smooth, performant way to display vertical videos with automatic play/pause based on visibility.

It ships with no runtime dependencies beyond React, a typed API, and both CommonJS and ES module builds.

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
- 🎯 Threshold-aware, transition-only visibility callbacks
- ⌨️ Keyboard navigation support (Arrow keys, Space, Home, End)
- ♿️ Accessibility features
- 📱 Full-screen and embedded feed layouts
- 🎨 Customizable loading and error states
- 🔄 Video loop and poster image support
- ⚡️ Browser-native preload control and stable observers
- 📦 TypeScript, CommonJS, and ES module support

## Demo

[Live Demo](https://reinaldosimoes.github.io/react-vertical-feed/)

You can check the console for logs when scrolling to check for when a video is visible or hidden, and when the end of the feed is reached.

<img src="./demo.gif" alt="React Vertical Feed Demo" width="300"/>

## Installation

```bash
npm install react-vertical-feed
# or
yarn add react-vertical-feed
```

## Usage

```tsx
import { VerticalFeed, type VideoItem } from 'react-vertical-feed';

const videos: VideoItem[] = [
  {
    id: 'intro',
    src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    loop: true,
  },
  {
    id: 'demo',
    src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4',
    loop: true,
  },
];

export function App() {
  return <VerticalFeed items={videos} style={{ height: '100dvh' }} />;
}
```

Videos are muted, inline, and autoplaying by default so browser autoplay policies work with the feed. Set `autoPlay: false` or override any video option per item.

### Embedded feeds

Items size themselves to the feed container, so the same component works in a card or modal:

```tsx
<VerticalFeed items={videos} style={{ height: 480, borderRadius: 16 }} />
```

### Interactive overlays

Use `renderItemOverlay` for captions and controls. Stop click propagation on interactive controls when the feed itself has an `onItemClick` handler.

```tsx
<VerticalFeed
  items={videos}
  onItemClick={(item, index) => console.log('Selected', item.id, index)}
  renderItemOverlay={(item, index) => (
    <button
      type="button"
      onClick={event => {
        event.stopPropagation();
        console.log('Liked', item.id, index);
      }}
      style={{ position: 'absolute', right: 24, bottom: 24 }}
    >
      Like
    </button>
  )}
/>
```

### Next.js App Router

`VerticalFeed` uses browser APIs, so render it from a Client Component:

```tsx
'use client';

import { VerticalFeed } from 'react-vertical-feed';

const videos = [
  {
    id: 'intro',
    src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  },
];

export default function VideoFeed() {
  return <VerticalFeed items={videos} />;
}
```

## API Reference

### Props

| Prop                  | Type                                                     | Default      | Description                                   |
| --------------------- | -------------------------------------------------------- | ------------ | --------------------------------------------- |
| `items`               | `VideoItem[]`                                            | **required** | Array of video items                          |
| `onEndReached`        | `() => void`                                             | -            | Callback when user scrolls to the end         |
| `loadingComponent`    | `React.ReactNode`                                        | -            | Custom loading component                      |
| `errorComponent`      | `React.ReactNode`                                        | -            | Custom error component                        |
| `className`           | `string`                                                 | -            | Additional CSS class                          |
| `style`               | `React.CSSProperties`                                    | -            | Additional CSS styles                         |
| `onItemVisible`       | `(item: VideoItem, index: number) => void`               | -            | Callback when item becomes visible            |
| `onItemHidden`        | `(item: VideoItem, index: number) => void`               | -            | Callback when item becomes hidden             |
| `onItemClick`         | `(item: VideoItem, index: number) => void`               | -            | Callback when item is clicked                 |
| `threshold`           | `number`                                                 | `0.75`       | Intersection observer threshold               |
| `scrollBehavior`      | `ScrollBehavior`                                         | `'smooth'`   | Scroll behavior for keyboard navigation       |
| `renderItemOverlay`   | `(item: VideoItem, index: number) => React.ReactNode`    | -            | Custom overlay component for each item        |
| `endReachedThreshold` | `number`                                                 | `100`        | Distance from bottom to trigger onEndReached  |
| `onVideoError`        | `(item: VideoItem, index: number, error: Error) => void` | -            | Callback when video loading or playback fails |
| `onCurrentItemChange` | `(index: number) => void`                                | -            | Callback when current visible item changes    |
| `defaultPreload`      | `'none' \| 'metadata' \| 'auto'`                         | `'metadata'` | Default preload strategy for videos           |
| `getItemKey`          | `(item: VideoItem, index: number) => React.Key`          | `id`/index   | Stable key for reordered or prepended items   |

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

Give dynamic items an `id`, or provide `getItemKey`, so loading and error state stays attached to the correct item when a feed is reordered or prepended.

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

This package ships ES2020 JavaScript for modern evergreen browsers. Consumers that support older browsers should transpile dependencies according to their own browser targets.

The runtime also requires:

- Intersection Observer API
- CSS Scroll Snap
- HTML5 Video

## Performance

The component is optimized for performance with:

- Browser-native video preload controls
- Automatic observer cleanup
- One container-rooted Intersection Observer
- Transition-only visibility callbacks

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
