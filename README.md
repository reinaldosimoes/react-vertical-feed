# React Vertical Feed

A React component for creating vertical video feeds similar to TikTok or Instagram. This component provides a smooth, performant way to display vertical videos with automatic play/pause based on visibility.

## Features

- 🎥 Automatic video play/pause based on visibility
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

| Prop               | Type                                       | Default      | Description                             |
| ------------------ | ------------------------------------------ | ------------ | --------------------------------------- |
| `items`            | `VideoItem[]`                              | **required** | Array of video items                    |
| `onEndReached`     | `() => void`                               | -            | Callback when user scrolls to the end   |
| `loadingComponent` | `React.ReactNode`                          | -            | Custom loading component                |
| `errorComponent`   | `React.ReactNode`                          | -            | Custom error component                  |
| `className`        | `string`                                   | -            | Additional CSS class                    |
| `style`            | `React.CSSProperties`                      | -            | Additional CSS styles                   |
| `onItemVisible`    | `(item: VideoItem, index: number) => void` | -            | Callback when item becomes visible      |
| `onItemHidden`     | `(item: VideoItem, index: number) => void` | -            | Callback when item becomes hidden       |
| `onItemClick`      | `(item: VideoItem, index: number) => void` | -            | Callback when item is clicked           |
| `threshold`        | `number`                                   | `0.75`       | Intersection observer threshold         |
| `scrollBehavior`   | `ScrollBehavior`                           | `'smooth'`   | Scroll behavior for keyboard navigation |

### VideoItem Type

```typescript
interface VideoItem {
  src: string;
  id?: string;
  metadata?: Record<string, unknown>;
  controls?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  playsInline?: boolean;
}
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
