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
  const items = [
    { type: 'video', src: 'https://example.com/video1.mp4' },
    { type: 'image', src: 'https://example.com/image1.jpg' },
    { type: 'video', src: 'https://example.com/video2.mp4' },
    // ... more media items
  ];

  const handleEndReached = () => {
    // Load more items
  };

  return (
    <VerticalFeed
      items={items}
      onEndReached={handleEndReached}
      showControls={true}
      loadingComponent={<LoadingSpinner />}
      errorComponent={<ErrorMessage />}
      mediaProps={{
        video: {
          preload: 'auto',
          loop: true,
        },
        image: {
          loading: 'lazy',
        },
      }}
    />
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

### MediaItem Type

```typescript
interface MediaItem {
  type: 'video' | 'image';
  src: string;
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
