# Yash Patel - AI Engineer Portfolio

A responsive portfolio built with Three.js, GSAP and Vite. The opening travels through a voxel city and a top-floor window into a music-loving character's workspace, then zooms into the portfolio. Agent cursors resize components and type content as visitors scroll.

The pixel sun/moon and the desk lamp share a manual day/night toggle. Phone and tablet views use device-sized previews during the screen transition. Reduced-motion preferences show completed content without automatic animation.

## Local development

```sh
npm ci
npm run dev
```

## Production

```sh
npm run build
npm run preview
```

Deploy `dist/` to a static host. There is no backend or external AI request; agent construction is a visual portfolio demonstration.

## GitHub Pages

`.github/workflows/deploy-pages.yml` builds and deploys on pushes to `main`. In repository Settings > Pages, choose GitHub Actions as the source. The default Vite base path supports the user site at `https://yashspatel.github.io/`.

## Editing

- `index.html`: portfolio content and links.
- `src/scene/`: city, traffic, camera, workspace, character and screen portal.
- `src/construction/`: shared agent pool, component fitting and typing.
- `src/project-data.js`: pending project descriptions.
- `src/theme.js`: saved manual theme choice.
- `src/readability.css`: responsive text sizing.
- `public/`: portrait, resume and static assets.

Original reference photos, local snapshots and conversation notes are excluded from source control. The portrait and resume in `public/` are intended public assets. The existing Chrome extension privacy page is retained at its original URL.

## Browser checks

With the development server running and Playwright installed:

```sh
python scripts/check_manual_build.py
python scripts/check_intersection.py
python scripts/check_sky_toggle.py
```

The character is a hand-built stylized voxel interpretation of reference photos. Three.js is lazy-loaded, static geometry is batched, city geometry is instanced, and rendering stops after the portfolio handoff.
