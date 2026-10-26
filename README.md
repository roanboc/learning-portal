# learning-portal

The front door for Learn All. One page sends visitors to the two series:

- [Learning Data](https://data.learn-all.org/) ([roanboc/learning-data](https://github.com/roanboc/learning-data)): short films, labs and scenarios on how a data platform works, from capture to decision
- [Learning Systems](https://systems.learn-all.org/) ([roanboc/learning-systems](https://github.com/roanboc/learning-systems)): simulations of one world, Gaia, seen at different levels of complexity and at different moments in the history of life

The English page is `site/index.html` and the Spanish page is `site/es/index.html`. Both use `site/assets/portal.css`, `site/assets/portal.js` and the pictures in `site/assets/img/`. There is no build step and no dependency beyond Google Fonts. The page is published to **https://learn-all.org/** by `.github/workflows/pages.yml` on every push to `main`. The `site/CNAME` file sets the domain.

## One-time setup

1. **Settings → Pages → Build and deployment → Source:** GitHub Actions.
2. **Settings → Pages → Custom domain:** `learn-all.org`. Turn on Enforce HTTPS once GitHub offers it.
3. **DNS (Cloudflare, DNS only, not proxied):** add `A` records for `learn-all.org` that point to GitHub Pages. Copy the addresses under the `pages` key at https://api.github.com/meta, which GitHub keeps current. Four addresses are common, but check that list rather than trusting this README.

The domain `learn-all.org` is already verified on the account.

## Behaviour

- **Big-screen note:** on phones (and short landscape screens) the page asks visitors to use a big screen, since some interactive parts may be hidden. Closing it is remembered in that browser only. CSS shows the note, so it also appears if JavaScript is off.
- **Dark mode:** the page follows the device setting. A `data-theme="dark"` or `data-theme="light"` attribute on `<html>` overrides it, the same way the series' stylesheets do. The series show no dark mode button, so the page has none either.
- **Languages:** the EN and ES links at the top switch between the two pages. The series keep their English names in Spanish.
- **Card pictures:** each card shows three pictures that crossfade every 3 seconds. Rotation pauses while the card is hovered or focused and while the tab is hidden; with reduced motion only the first picture shows. `site/assets/img/data/` holds stills from Learning Data's films (`site/assets/*-poster.jpg` in that repo, CC BY 4.0, chosen without third-party logos). `site/assets/img/systems/` holds screenshots of the live Learning Systems pages (the home planet, World Viewer's Early Earth up close, and Tissue Lab), since that repo has no image files. All are 960×540 WebP. When you change a picture, update its `alt` text in both languages.
- **Background:** a faint neural network drawn on a canvas behind the page (`.neural-bg` in the CSS, the last part of `portal.js`). Neurons fire now and then and send pulses to their neighbours. Its colours and strength come from `--net`, `--net-fire` and `--net-opacity`, set for light and dark mode. It pauses while the tab is hidden, and with reduced motion it is drawn once, still.
