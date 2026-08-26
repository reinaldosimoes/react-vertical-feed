# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.2.1] - 2026-08-26

### Changed

- Validate the demo media assets before each GitHub Pages deployment
- Use three distinct, self-hosted CC0 portrait clips in the demo
- Document scroll containment, keyboard input, reduced motion, and demo media provenance
- Add UI, media-structure, and browser scroll-isolation tests for the demo

### Fixed

- Restore demo playback after the previous video host stopped serving the sample files
- Animate the pause indicator when playback pauses or resumes
- Remove optional demo animations when the user requests reduced motion
- Prevent an embedded feed from chaining vertical overscroll to the browser page
- Keep `scrollToItem` navigation inside the feed container
- Let native controls and supported ARIA controls process their own keyboard input
- Replace the broken video URLs in the README examples

## [0.2.0] - 2026-08-25

### Added

- Stable `getItemKey` support for dynamic feeds
- Explicit CommonJS and ES module package exports
- Package installation smoke tests for both module formats and React 17
- Keyboard activation and ARIA position metadata for feed items

### Changed

- Size feed items to their container so embedded feeds work correctly
- Root visibility tracking to the feed container and honor the configured threshold
- Emit visibility and current-item callbacks only when state changes
- Keep videos visible while browser loading is deferred
- Refresh compatible development dependencies and remove known audit findings
- Replace the README opening with a dependency-free quick start and tested recipes
- Clean build output before every package build

### Fixed

- Respect `autoPlay: false` when an item becomes visible
- Keep loading and error state attached to stable items after reordering
- Report native media loading failures through `onVideoError`
- Prevent handled navigation keys from also scrolling the page
- Avoid toggling demo playback when an overlay control is clicked
- Exclude test declarations and stale build artifacts from the published package

## [0.1.21] - 2026-01-18

### Added

- Video loop, poster, and preload options
- End-reached threshold configuration
- Playback error and current-item callbacks
- Space, Home, and End keyboard controls
- Expanded interactive demo

### Changed

- Keep callback refs stable to avoid unnecessary observer recreation
- Allow end-reached callbacks to fire again after leaving the threshold
- Refresh development dependencies

## [0.1.20] - 2025-10-20

### Changed

- Refresh development dependencies and transitive security fixes

## [0.1.19] - 2025-10-20

### Changed

- Refresh development dependencies

Earlier release history is available in the [GitHub releases](https://github.com/reinaldosimoes/react-vertical-feed/releases).

[Unreleased]: https://github.com/reinaldosimoes/react-vertical-feed/compare/v0.2.1...HEAD
[0.2.1]: https://github.com/reinaldosimoes/react-vertical-feed/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/reinaldosimoes/react-vertical-feed/compare/v0.1.21...v0.2.0
[0.1.21]: https://github.com/reinaldosimoes/react-vertical-feed/compare/v0.1.20...v0.1.21
[0.1.20]: https://github.com/reinaldosimoes/react-vertical-feed/compare/v0.1.19...v0.1.20
[0.1.19]: https://github.com/reinaldosimoes/react-vertical-feed/compare/v0.1.18...v0.1.19
