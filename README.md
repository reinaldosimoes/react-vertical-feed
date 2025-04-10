# React Vertical Feed

A React component for creating vertical media feeds (videos and images) similar to TikTok or Instagram. This component provides a smooth, performant way to display vertical content with automatic play/pause for videos based on visibility.

## Features

- 🎥 Automatic video play/pause based on visibility
- 🖼️ Support for both videos and images
- ⌨️ Keyboard navigation support
- ♿️ Accessibility features
- 📱 Mobile-friendly
- 🎨 Customizable loading and error states
- ⚡️ Performance optimized
- 📦 TypeScript support

## Installation

```bash
npm install react-vertical-feed
# or
yarn add react-vertical-feed
```

## Usage

```tsx
import { VerticalFeed } from 'react-vertical-feed';

const App = () => {
  const videos = [
    'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  ];

  const items = videos.map(video => ({
    type: 'video',
    src: video,
    controls: true,
    autoPlay: true,
    muted: true,
    playsInline: true,
  }));

  const handleEndReached = () => {
    console.log('End reached');
  };

  return (
    <div className="w-full h-screen">
      <VerticalFeed items={items} onEndReached={handleEndReached} className="h-full" />
    </div>
  );
};
```

## Props

| Prop               | Type                                         | Default      | Description                             |
| ------------------ | -------------------------------------------- | ------------ | --------------------------------------- |
| `items`            | `MediaItem[]`                                | **required** | Array of media items (videos or images) |
| `onEndReached`     | `() => void`                                 | -            | Callback when user scrolls to the end   |
| `showControls`     | `boolean`                                    | `false`      | Show video controls                     |
| `loadingComponent` | `React.ReactNode`                            | -            | Custom loading component                |
| `errorComponent`   | `React.ReactNode`                            | -            | Custom error component                  |
| `mediaProps`       | `{ video?: VideoProps; image?: ImageProps }` | `{}`         | Additional media element props          |

### MediaItem Types

```typescript
interface MediaItem {
  type: 'video' | 'image';
  src: string;
  id?: string;
  metadata?: Record<string, unknown>;
  controls?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  playsInline?: boolean;
}

interface VideoItem extends MediaItem {
  type: 'video';
  controls?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  playsInline?: boolean;
}

interface ImageItem extends MediaItem {
  type: 'image';
}

type MediaItemType = VideoItem | ImageItem;
```

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
```

## License

MIT © [reinaldosimoes](https://github.com/reinaldosimoes)
