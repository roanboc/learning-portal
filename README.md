# learning-portal

The front door for Learn All. One page sends visitors to the two series:

- [Learning Data](https://data.learn-all.org/): how data moves and keeps its meaning
- [Learning Systems](https://systems.learn-all.org/): how living systems organise themselves

The English page is `site/index.html` and the Spanish page is `site/es/index.html`. Both use `site/assets/portal.css`, `site/assets/portal.js` and the two art files. The page is published to **https://learn-all.org/** by `.github/workflows/pages.yml` on every push to `main`. The `site/CNAME` file sets the domain.

## One-time setup

1. **Settings → Pages → Build and deployment → Source:** GitHub Actions.
2. **Settings → Pages → Custom domain:** `learn-all.org`. Turn on Enforce HTTPS once GitHub offers it.
3. **DNS (Cloudflare, DNS only, not proxied):** add `A` records for `learn-all.org` that point to GitHub Pages. Copy the addresses under the `pages` key at https://api.github.com/meta, which GitHub keeps current. Four addresses are common, but check that list rather than trusting this README.

The domain `learn-all.org` is already verified on the account.

## Behaviour

- **Big-screen note:** on phones (and short landscape screens) the page asks visitors to use a big screen, since some interactive parts may be hidden. Closing it is remembered in that browser only. CSS shows the note, so it also appears if JavaScript is off.
- **Dark mode:** the page follows the device setting. A `data-theme="dark"` or `data-theme="light"` attribute on `<html>` overrides it, the same way the series' stylesheets do. The series show no dark mode button, so the page has none either.
- **Languages:** the EN and ES links at the top switch between the two pages. The series keep their English names in Spanish.
