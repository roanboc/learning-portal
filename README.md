# learning-portal

The front door for Learn All. One page sends visitors to the two series:

- [Learning Data](https://data.learn-all.org/): how data moves and keeps its meaning
- [Learning Systems](https://systems.learn-all.org/): how living systems organise themselves

The page is `site/index.html`. It is published to **https://learn-all.org/** by `.github/workflows/pages.yml` on every push to `main`. The `site/CNAME` file sets the domain.

## One-time setup

1. **Settings → Pages → Build and deployment → Source:** GitHub Actions.
2. **Settings → Pages → Custom domain:** `learn-all.org`. Turn on Enforce HTTPS once GitHub offers it.
3. **DNS (Cloudflare, DNS only, not proxied):** add four `A` records for `learn-all.org` pointing to GitHub Pages: `185.199.108.153`, `185.199.109.153`, `185.199.110.153` and `185.199.111.153`. Check GitHub's Pages documentation for the current addresses first.

The domain `learn-all.org` is already verified on the account.
