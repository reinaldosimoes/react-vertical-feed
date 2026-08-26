# React Vertical Feed Demo

This project demonstrates the `react-vertical-feed` component.

## Demonstrated behavior

- Play and pause based on item visibility
- Vertical scroll snap
- Keyboard navigation
- Visibility and current-item callbacks
- End-of-feed detection
- Reduced-motion behavior
- Responsive layout

## Run the demo

Run these commands from the repository root.

```bash
# Install the locked demo dependencies
npm --prefix examples/demo ci

# Start the development server
npm --prefix examples/demo run dev
```

## Verify the demo

Run these commands from the repository root.

```bash
# Install the Chromium test browser
npm --prefix examples/demo exec -- playwright install chromium

# Run the UI, media, and browser tests
npm --prefix examples/demo test

# Type-check and build the production files
npm --prefix examples/demo run build

# Preview the completed production build
npm --prefix examples/demo run preview
```

The media check confirms that the demo references three distinct local MP4 files. It checks each MP4 box structure and minimum file size. It also checks for H.264 video and fast-start metadata.

## Keyboard input

Move focus to the feed before you use its keyboard commands. Use Arrow Up or Arrow Down to change the current video. Use Home or End to move to a feed boundary. Use Space to play or pause the current video.

An interactive overlay control owns its keyboard input. The feed does not process these keys while focus is on a supported interactive control.

## Scroll containment

The component contains vertical overscroll by default. This behavior stops a wheel or touch scroll from moving to the browser page at a feed boundary.

The demo is a full-screen feed. Its root fills the viewport and hides overflow. For an embedded feed, set `style={{ overscrollBehaviorY: 'auto' }}` if the page must continue scrolling at a feed boundary.

## Reduced motion

The demo reads the `prefers-reduced-motion` media query. When the user requests reduced motion, the demo turns off autoplay and pauses all videos. The user can start a video with the Play control or a tap.

The demo also removes the pause-indicator transition. It stops the marquee, like, and loading animations.

## Demo structure

- `App.tsx`: Main demo component
- `src/main.tsx`: Application entry point
- `src/index.css`: Global styles
- `public/videos`: Local demo video files
- `scripts/verify-media.mjs`: Demo media verification
- `tests/scroll-isolation.spec.ts`: Browser scroll-isolation tests
- `VIDEO_SOURCES.md`: Video source and rights information
- `vite.config.ts`: Vite configuration
- `package.json`: Project dependencies and scripts

## Notes

- The demo uses three local CC0 video excerpts.
- The demo mutes all videos by default.
- The feed uses the full viewport height and width.
- See [VIDEO_SOURCES.md](./VIDEO_SOURCES.md) for source and rights information.
