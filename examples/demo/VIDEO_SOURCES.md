# Demo Video Sources

The demo uses three local video excerpts. The source files use the [Creative Commons CC0 1.0 Universal dedication](https://creativecommons.org/publicdomain/zero/1.0/).

| Demo file         | Source                                                                                  | Creator    | Rights |
| ----------------- | --------------------------------------------------------------------------------------- | ---------- | ------ |
| `clouds.mp4`      | [Flight over clouds](https://commons.wikimedia.org/wiki/File:Flight_over_clouds.webm)   | L. Shyamal | CC0    |
| `wind.mp4`        | [Escullar aerogen](https://commons.wikimedia.org/wiki/File:Escullar_aerogen.webm)       | MdeVicente | CC0    |
| `grasshopper.mp4` | [Grasshopper on wall](https://commons.wikimedia.org/wiki/File:Grasshopper_on_wall.webm) | L. Shyamal | CC0    |

## Media preparation

Each excerpt starts one second after the start of its source file. Each excerpt has a duration of seven seconds. The preparation process removes the audio.

Each demo file has these properties:

- H.264 video
- YUV 4:2:0 pixel format
- MP4 container with fast-start metadata
- 540 by 960 pixels
- 30 frames per second

## Verify the files

Run these commands from the repository root:

```bash
# Install the Chromium test browser
npm --prefix examples/demo exec -- playwright install chromium

# Run the UI, media, and browser tests
npm --prefix examples/demo test

# Type-check and build the demo
npm --prefix examples/demo run build
```

The media check confirms that the demo references three distinct files. It checks each MP4 box structure and minimum file size. It also checks for H.264 video and fast-start metadata.

The media check does not verify source rights. Review this file and each source page before you replace a demo video.
