# Image generation brief

> **Current status:** every file below already exists in `public/images/` as a code-rendered illustration (concrete house with orange doorway, ridge layers, wireframe terrain, isometric studies, facade) so the site looks finished. They are stylised, not photographic. If you want true photography, generate the prompts below and overwrite the same filenames. `hireish-ui.png` is a real capture of hireish.in, and `hireish-logo.svg` is the Hireish favicon from its codebase.

Generate each image separately (one prompt per image) and save it under the **exact filename** shown, in `public/images/`.
Until a file exists, the site shows a labelled placeholder at the correct aspect ratio, so nothing is broken.

## Shared art direction (already included in every prompt)

- Editorial, Swiss-inspired, architectural. Think a high-end architecture magazine, not stock photography.
- Palette: warm ivory `#F5F3ED`, charcoal `#151515` / `#111111`, grayscale mid-tones, and **one** restrained burnt-orange accent `#F06428` (a door, a panel, a sliver of light). Orange should cover well under 10% of the frame.
- Soft overcast light, deep shadows, fine film grain, generous negative space, calm and precise composition.
- **Global negatives for every prompt:** no text, no letters, no numbers, no logos, no watermarks, no UI, no neon, no purple or blue tint, no glowing orbs, no sci-fi HUD, no cartoon or 3D-render look, no clear human faces.

Reference mood: a concrete house with a sheared wall and a single orange door (Doldam, one-aftr), monochrome mountain ridges, dark point-cloud landscapes.

## Asset manifest

| ID | Filename | Used in | Ratio | Output size | Text in image? | Priority |
|---|---|---|---|---|---|---|
| A1 | `hero-architecture.jpg` | Hero, large right panel (cropped to fill on desktop, 4:5 on mobile) | 4:5 | 1600 x 2000 | No | P0 |
| A2 | `hero-mountain.jpg` | Hero, small crop at the left page edge (desktop only) | 3:4 | 900 x 1200 | No | P1 |
| A3 | `hero-signal.jpg` | Hero, dark technical panel overlapping A1 (small text is overlaid in HTML) | 4:3 | 1200 x 900 | No | P0 |
| A4 | `hireish-stage.jpg` | Projects, backdrop behind the Hireish product screenshot (also the case study page) | 16:10 | 1920 x 1200 | No | P0 |
| A5 | `experience-building.jpg` | Experience band, beside the heading (dark section) | 16:9 | 1600 x 900 | No (leave the facade panel blank) | P1 |
| A6 | `writing-rag.jpg` | Writing card 1 | 16:10 | 1200 x 750 | No | P2 |
| A7 | `writing-cost.jpg` | Writing card 2 | 16:10 | 1200 x 750 | No | P2 |
| A8 | `writing-devtools.jpg` | Writing card 3 | 16:10 | 1200 x 750 | No | P2 |

Not generated (and why):

- **Hireish product screenshot** `hireish-ui.png`: take a real screenshot of hireish.in (a clean 16:10 browser capture, dark UI), so the product is shown truthfully.
- **Roast My Resume sample** and **Hireish logo**: real files from the Hireish repo are already in `public/images/`.
- **Systems diagram, tech stack tiles, OG share image, favicon and the swan mark**: drawn in code (SVG/CSS), not images.

Crop notes: A1 is cropped to fill a tall column on desktop, so keep the subject (the orange doorway) in the **centre-right** and leave the top-left calm. A3 sits under small white mono labels in its top-left corner, so keep that corner dark and quiet.

---

## A1: `hero-architecture.jpg` (4:5, 1600 x 2000)

```
Editorial architectural photograph of a brutalist raw concrete house, shot from a low, slightly angled viewpoint. A tall, slightly sheared concrete wall dominates the frame with visible board-formed texture and subtle weathering. A single deep burnt-orange (#F06428) doorway or panel is recessed into the wall, glowing softly as the only colour in the image. A small distant human silhouette stands near the opening for scale (no visible face). Pale ivory overcast sky, strong geometric shadows, calm minimal composition with a lot of negative space in the upper left. Warm off-white and charcoal grayscale tones, fine film grain, shot on medium format, architecture magazine quality. Vertical 4:5 composition, subject in the centre-right.
Negative: text, letters, logos, watermark, people's faces, neon, purple or blue tint, sci-fi, 3D render look, oversaturation, fisheye distortion.
```

## A2: `hero-mountain.jpg` (3:4, 900 x 1200)

```
Moody black-and-white photograph of a rugged mountain ridge half hidden in low cloud and mist, high contrast but soft, layered silhouettes receding into pale fog. Pure grayscale with a very slight warm ivory tint, fine film grain, quiet and minimal, large area of soft empty sky at the top. Vertical 3:4 composition. No orange in this image.
Negative: text, logos, watermark, people, buildings, colour saturation, HDR look, dramatic sunset, snow-sparkle effects.
```

## A3: `hero-signal.jpg` (4:3, 1200 x 900)

```
Abstract dark technical visualisation: a flowing wireframe terrain made of fine thin white and light-gray lines and tiny points, like a point-cloud mountain range or neural network landscape, floating on a near-black (#111111) background. Delicate, precise, scientific and quiet. One or two tiny burnt-orange (#F06428) data points and a single thin orange curved line as the only accent. The top-left corner stays dark and empty. Subtle depth of field, very fine grain. Horizontal 4:3 composition.
Negative: text, numbers, labels, logos, watermark, glowing orbs, bright neon, purple or blue gradients, globes, sci-fi HUD, lens flares, cartoon look.
```

## A4: `hireish-stage.jpg` (16:10, 1920 x 1200)

```
Dark atmospheric backdrop for a product showcase. A near-black charcoal (#111111) surface with a very subtle fine grid pattern and a soft diagonal gradient of burnt-orange (#F06428) light bleeding in from the bottom-right corner, fading to black. Slight film grain, soft vignette, empty centre area (a screenshot will be placed there later). Premium, minimal, editorial. Horizontal 16:10.
Negative: text, UI elements, laptop or phone mockups, logos, watermark, people, glowing orbs, neon, purple or blue tint, bright orange flooding the whole frame (orange only in the corner).
```

## A5: `experience-building.jpg` (16:9, 1600 x 900)

```
Architectural photograph of a modern concrete and glass healthcare building facade in muted greyscale, seen from a low angle against a pale ivory sky. A single large flat burnt-orange (#F06428) rectangular panel is mounted on the upper facade; the panel must be completely blank, with no lettering or signage. Strong vertical lines, soft overcast light, a little greenery (out of focus tree leaves) at the lower edge for scale. Calm, precise, editorial composition, fine film grain, horizontal 16:9. Works on a dark page background, so keep the sky slightly muted rather than pure white.
Negative: text, signage, letters, logos, watermark, people, busy street scene, saturated colours other than the orange panel.
```

## A6: `writing-rag.jpg` (16:10, 1200 x 750)

```
Dark minimal editorial image for an article about model-independent retrieval systems: three simple abstract geometric volumes in charcoal and light gray (a cube, a slab and a cylinder) arranged on a dark surface connected by one thin burnt-orange (#F06428) line, like a precise architectural model photographed in soft side light. Near-black background, fine grain, lots of negative space. Horizontal 16:10.
Negative: text, logos, watermark, people, glowing effects, neon, purple or blue tint, circuit-board clichés, robots.
```

## A7: `writing-cost.jpg` (16:10, 1200 x 750)

```
Dark minimal editorial image for an article about cost optimisation: a monolithic charcoal concrete staircase or stepped descending blocks in strict geometric perspective, lit by a single narrow slit of burnt-orange (#F06428) light from the side, deep shadows, near-black surroundings. Conveys "going down" and efficiency. Fine film grain, calm, architectural. Horizontal 16:10.
Negative: text, numbers, currency symbols, coins, charts, logos, watermark, people, neon, purple or blue tint, 3D-render look.
```

## A8: `writing-devtools.jpg` (16:10, 1200 x 750)

```
Dark minimal editorial image for an article about context-aware developer tools: a close architectural detail of a grid of thin steel lines and small square apertures in a charcoal concrete wall, one small square aperture glowing burnt-orange (#F06428). Soft raking light, shallow depth of field, near-black tones with ivory highlights, fine film grain. Suggests an index or map. Horizontal 16:10.
Negative: text, code, letters, screens, keyboards, logos, watermark, people, neon, purple or blue tint, sci-fi HUD.
```

---

## When the images are ready

1. Drop each file into `public/images/` with the exact filename above (JPG, or re-save PNG/WebP as `.jpg`; keep the name).
2. No code change is needed: the page already references these names. Restart `npm run dev` if the placeholder does not disappear.
3. After deploy you can also swap any image from `/admin` (Profile & hero, Projects, Writing) by uploading a file instead.
