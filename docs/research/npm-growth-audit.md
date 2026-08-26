# npm Growth Audit

Date: 2026-08-25

## Executive recommendation

Keep `react-vertical-feed` video-first for the next release. Its best path beyond roughly 1,000 weekly downloads is a trustworthy `0.2` release that fixes the current visibility and sizing semantics, clarifies browser preload behavior, and replaces the README's large broken first example with a copy-paste quick start. Do not broaden the package into a general social-feed framework yet.

The package already has a useful niche position. The npm downloads API reports 1,265 downloads for August 18-24, 2026, versus 975 for `@reelkit/react`, 196 for `@page-speed/media-immersive`, and 60 for `react-tiktok-style-video-scroller` over the same dates ([react-vertical-feed](https://api.npmjs.org/downloads/point/2026-08-18:2026-08-24/react-vertical-feed), [ReelKit](https://api.npmjs.org/downloads/point/2026-08-18:2026-08-24/@reelkit/react), [media-immersive](https://api.npmjs.org/downloads/point/2026-08-18:2026-08-24/@page-speed/media-immersive), [video-scroller](https://api.npmjs.org/downloads/point/2026-08-18:2026-08-24/react-tiktok-style-video-scroller)). The immediate opportunity is to convert that existing discovery into confident installation and retention.

## Current position

- Weekly downloads are volatile but healthy for the niche: 486, 1,435, 1,010, and 1,265 across the four full weeks ending August 24, an average of 1,049 per week ([npm downloads API](https://api.npmjs.org/downloads/range/2026-07-28:2026-08-24/react-vertical-feed)).
- The repository currently has 14 stars, 1 fork, and no open non-pull-request issues. The latest push shown by the GitHub API was April 6, 2026 ([GitHub repository API](https://api.github.com/repos/reinaldosimoes/react-vertical-feed)).
- npm's current release is `0.1.21`; it has no runtime dependencies beyond React peer dependencies, contains 17 published files, and is about 94 KB unpacked ([npm registry](https://registry.npmjs.org/react-vertical-feed/latest)).
- The live GitHub Pages demo is available, which is an important trust asset ([live demo](https://reinaldosimoes.github.io/react-vertical-feed/)).
- The closest competitor by downloads, `@reelkit/react`, explicitly markets hooks, virtualization, touch gestures, and a dedicated documentation site in its npm metadata. Other competitors lead with virtual rendering, full customization, or composability ([ReelKit registry metadata](https://registry.npmjs.org/@reelkit%2freact/latest), [video-scroller metadata](https://registry.npmjs.org/react-tiktok-style-video-scroller/latest), [media-immersive metadata](https://registry.npmjs.org/@page-speed%2fmedia-immersive/latest)).

## Adoption blockers

### 1. The first-use path creates avoidable doubt

The README's first example uses `useState` and `VideoItem` without importing them, begins with a third-party `lucide-react` dependency, and is much longer than the minimal package setup. It also uses an `http://` media URL, which can be blocked as mixed content on an HTTPS app ([README usage example](https://github.com/reinaldosimoes/react-vertical-feed/blob/0cb7517f5c3dee2b9681c21c7b74f1b694314ea2/README.md#usage)).

Put a dependency-free 10-15 line quick start first. Move overlay customization into a second recipe. Add framework recipes only where tested, starting with Vite and Next.js client usage.

### 2. Published promises and implementation do not agree

The changelog claims support for image feeds and custom item rendering, but the exported interface only accepts `VideoItem[]` and provides an overlay renderer. The README claims lazy loading, but the implementation maps every item to a mounted `<video>` element; `preload` is only a browser hint ([changelog](https://github.com/reinaldosimoes/react-vertical-feed/blob/0cb7517f5c3dee2b9681c21c7b74f1b694314ea2/CHANGELOG.md#L75-L93), [source](https://github.com/reinaldosimoes/react-vertical-feed/blob/0cb7517f5c3dee2b9681c21c7b74f1b694314ea2/src/VerticalFeed.tsx#L228-L306), [HTML preload specification](https://html.spec.whatwg.org/multipage/urls-and-fetching.html#attr-media-preload)).

Either ship those capabilities or remove the claims. Trustworthy narrow positioning is more valuable than a wider unsupported promise.

### 3. Core behavior conflicts with the public interface

- `autoPlay: false` is not respected when an item intersects because the observer calls `video.play()` unconditionally ([source](https://github.com/reinaldosimoes/react-vertical-feed/blob/0cb7517f5c3dee2b9681c21c7b74f1b694314ea2/src/VerticalFeed.tsx#L119-L147)).
- The observer uses the viewport as its root rather than the feed container. This can select or play the wrong item when the feed is embedded or clipped. Intersection Observer supports an element root specifically for this case ([source](https://github.com/reinaldosimoes/react-vertical-feed/blob/0cb7517f5c3dee2b9681c21c7b74f1b694314ea2/src/VerticalFeed.tsx#L119-L152), [Intersection Observer specification](https://w3c.github.io/IntersectionObserver/#intersection-observer-interface)).
- Items are hard-coded to `100vh` even when callers override the container height. The README's `h-full` example therefore does not actually make each item match a non-viewport container ([source](https://github.com/reinaldosimoes/react-vertical-feed/blob/0cb7517f5c3dee2b9681c21c7b74f1b694314ea2/src/VerticalFeed.tsx#L233-L266)).
- The feed's children use `role="region"`, while the WAI-ARIA feed pattern expects article children and supplies `aria-posinset` and `aria-setsize` guidance ([source](https://github.com/reinaldosimoes/react-vertical-feed/blob/0cb7517f5c3dee2b9681c21c7b74f1b694314ea2/src/VerticalFeed.tsx#L233-L246), [WAI-ARIA feed pattern](https://www.w3.org/WAI/ARIA/apg/patterns/feed/)).

These are adoption issues, not merely internal cleanup. The package's differentiating claims are performance, predictable autoplay, embedding, and accessibility.

### 4. Package and release metadata look less mature than the implementation

The package publishes `main`, `module`, and `types`, but no explicit `exports` map. An exports map would define supported entry points and conditional CommonJS/ES module loading for modern tooling ([package metadata](https://registry.npmjs.org/react-vertical-feed/latest), [Node.js package entry points](https://nodejs.org/api/packages.html#package-entry-points)).

The changelog contains duplicated versions and a `0.1.21` date earlier than `0.1.19`, while the actual GitHub `v0.1.21` release was published January 18, 2026 and describes dependency updates rather than the changelog's feature list ([changelog](https://github.com/reinaldosimoes/react-vertical-feed/blob/0cb7517f5c3dee2b9681c21c7b74f1b694314ea2/CHANGELOG.md), [GitHub release](https://github.com/reinaldosimoes/react-vertical-feed/releases/tag/v0.1.21)). Clean release notes, real npm version/download badges, tested compatibility claims, and a small bundle statement would improve trust at low implementation cost.

## Ranked implementation vote

### 1. Video-first reliability and package trust

**Vote: 5/5. Ship next.**

Preserve the existing `VerticalFeed`, `VideoItem`, overlay callback, and imperative ref. Fix the observer root, select an active item using the configured visibility threshold, respect `autoPlay`, make items size to the feed container, align the ARIA structure with the feed pattern, and verify the packed CommonJS and ES module entry points across supported React versions.

This is the best combination of adoption leverage, interface depth, and achievable scope. It makes the core promise trustworthy without asking callers to learn a new model or accepting unmeasured lifecycle risk.

### 2. A generic vertical pager with the video feed as an adapter

**Vote: 3/5. Validate demand before building.**

A future `VerticalPager<T>` could own snap scrolling, visibility, keyboard navigation, and windowing, while `VerticalFeed` remains a video adapter. This creates a clean seam for images, product cards, and mixed media and offers the most long-term flexibility.

It also doubles the public interface and documentation burden. Build it only after issues, discussions, or usage telemetry show meaningful demand for non-video items. Do not replace `VerticalFeed` with a generic renderer in the next release.

### 3. Extend `VideoItem` into a video/image discriminated union

**Vote: 2/5. Do not prioritize.**

This would make the old changelog claim true, but it adds branching throughout loading, error, autoplay, and accessibility behavior without solving arbitrary-content demand. It is less deep than a pager seam and distracts from the package's strongest current position: a small, video-specific module.

## Release and growth sequence

1. Ship the correctness fixes and regression tests. Treat `autoPlay`, embedded-height behavior, active-item selection, callback cardinality, and overlay interaction as public contracts.
2. Measure network requests, memory, and mounted video cost in a long feed before deciding whether an opt-in `overscan` control is justified.
3. Rewrite the README opening around a minimal copy-paste example, a concise “why this package” section, the live demo, measured bundle size, React compatibility, and two advanced recipes.
4. Add an explicit exports map and test both ESM and CommonJS consumers from the packed tarball, not only the repository build.
5. Publish coherent `0.2.0` notes and measure 4-week rolling downloads, README-to-demo clicks if available, GitHub stars, and issue quality. A reasonable initial target is a sustained 1,500 weekly downloads before broadening the interface.

The design principle is straightforward: deepen the existing module first. More reliable behavior behind the same small interface will create more leverage than adding several shallow feature flags.
