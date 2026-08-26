# React Vertical Feed

[![npm version](https://img.shields.io/npm/v/react-vertical-feed.svg)](https://www.npmjs.com/package/react-vertical-feed)
[![weekly downloads](https://img.shields.io/npm/dw/react-vertical-feed.svg)](https://www.npmjs.com/package/react-vertical-feed)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/react-vertical-feed)](https://bundlephobia.com/result?p=react-vertical-feed)
[![CI](https://github.com/reinaldosimoes/react-vertical-feed/actions/workflows/package.yml/badge.svg)](https://github.com/reinaldosimoes/react-vertical-feed/actions/workflows/package.yml)
[![Coverage](https://github.com/reinaldosimoes/react-vertical-feed/actions/workflows/coverage.yml/badge.svg)](https://github.com/reinaldosimoes/react-vertical-feed/actions/workflows/coverage.yml)

A React component for a vertical video feed. Each item fills the feed container. The component uses scroll snap and item visibility to control playback.

The package declares no runtime dependencies. It requires React and React DOM as peer dependencies. The package includes TypeScript types, a CommonJS build, and an ES module build.

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
    - [Reduced Motion](#reduced-motion)
    - [Programmatic Control](#programmatic-control)
  - [Browser Compatibility](#browser-compatibility)
  - [Performance](#performance)
  - [Development](#development)
    - [Test Coverage](#test-coverage)
  - [License](#license)

## Features

- 🎥 Automatic video playback based on visibility
- 🎯 Threshold-aware, transition-only visibility callbacks
- 🧱 Contained vertical overscroll by default
- ⌨️ Keyboard navigation support (Arrow keys, Space, Home, End)
- ♿️ ARIA feed and item metadata
- 📱 Full-screen and embedded feed layouts
- 🎨 Customizable loading and error states
- 🔄 Video loop and poster image support
- ⚡️ Browser-native preload control and stable observers
- 📦 TypeScript, CommonJS, and ES module support

## Demo

[Live Demo](https://reinaldosimoes.github.io/react-vertical-feed/)

Open the browser console to see visibility and end-of-feed events.

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

Videos are muted, inline, and set to autoplay by default. These defaults support browser autoplay rules. Set `autoPlay: false` on an item to turn off autoplay for that item.

### Embedded feeds

Each item uses the size of the feed container. Set the container height when you put the feed in a card or modal.

```tsx
<VerticalFeed items={videos} style={{ height: 480, borderRadius: 16 }} />
```

The feed sets `overscrollBehaviorY` to `contain` by default. This setting prevents vertical scroll chaining when the feed reaches its first or last item. The browser page does not continue the same wheel or touch scroll.

Set `overscrollBehaviorY` to `auto` when you want the browser page to continue scrolling at a feed boundary:

```tsx
<VerticalFeed items={videos} style={{ height: 480, overscrollBehaviorY: 'auto' }} />
```

The `style` prop overrides the default component styles.

### Interactive overlays

Use `renderItemOverlay` for captions and controls. Stop click propagation on each interactive control when the feed has an `onItemClick` handler.

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
| `style`               | `React.CSSProperties`                                    | -            | Styles that override the default feed styles  |
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

Give each dynamic item an `id`. You can also provide `getItemKey`. A stable key keeps loading and error state with the correct item after a reorder or prepend operation.

### Keyboard Navigation

| Key     | Action                   |
| ------- | ------------------------ |
| `↑`     | Scroll to previous video |
| `↓`     | Scroll to next video     |
| `Space` | Play/pause current video |
| `Home`  | Scroll to first video    |
| `End`   | Scroll to last video     |

Move keyboard focus to the feed before you use these keys. The feed prevents the browser page from performing the same keyboard scroll.

An interactive overlay control owns its keyboard input. The feed does not handle a navigation key when the focused element is a button, link, form control, editable element, or supported interactive ARIA role.

When you provide `onItemClick`, each item can receive keyboard focus. Press Enter to activate the focused item.

### Reduced Motion

The package does not read the `prefers-reduced-motion` media query. Your application controls autoplay and animation behavior.

The demo reads this media query. When the user requests reduced motion, the demo turns off video autoplay and pauses all videos. The demo also removes the pause-indicator transition and its decorative marquee, like, and loading animations. The user can still start a video with the Play control or a tap.

### Programmatic Control

Use a ref to control the feed:

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

This package ships ES2020 JavaScript for current evergreen browsers. If your application supports an older browser, transpile this package for your browser targets.

The runtime also requires:

- Intersection Observer API
- CSS Scroll Snap
- HTML5 Video

## Performance

The component uses these performance controls:

- Browser-native video preload controls
- Automatic observer cleanup
- One container-rooted Intersection Observer
- Transition-only visibility callbacks

## Development

```bash
# Install the locked dependencies
npm ci

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

Run the complete package and demo checks from the repository root:

```bash
# Verify the package tests, lint, build, size, package contents, and audit
npm run test:release

# Install the locked demo dependencies
npm --prefix examples/demo ci

# Install the Chromium test browser
npm --prefix examples/demo exec -- playwright install chromium

# Run the demo UI, media, and browser tests
npm --prefix examples/demo test

# Type-check and build the demo
npm --prefix examples/demo run build
```

### Test Coverage

The Coverage workflow creates a coverage report for each pull request. To read the report:

1. Open the latest Coverage workflow run.
2. Download the `coverage-report` artifact.
3. Open `index.html` in a browser.

## License

MIT © [reinaldosimoes](https://github.com/reinaldosimoes)
