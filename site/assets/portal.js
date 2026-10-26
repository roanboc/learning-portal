// The big-screen note: shown on phones by CSS. Closing it is remembered in this browser only,
// and if storage is blocked the note simply shows again on the next visit.
(() => {
  const note = document.querySelector('[data-big-screen]');
  if (!note) return;
  const key = 'learn-all-big-screen-closed';
  let closed = false;
  try { closed = localStorage.getItem(key) === '1'; } catch (e) { /* storage blocked: show the note */ }
  if (closed) note.hidden = true;
  note.querySelector('button').addEventListener('click', () => {
    note.hidden = true;
    try { localStorage.setItem(key, '1'); } catch (e) { /* not saved: the note returns next visit */ }
    // Keep keyboard focus on the page, since the button has just gone.
    document.querySelector('h1').focus({ preventScroll: true });
  });
})();

// Card pictures: each card crossfades through its pictures every few seconds. With reduced
// motion the first picture stays. Rotation pauses while the card is hovered or focused, and
// while the tab is hidden. Without JavaScript the first picture simply shows.
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const INTERVAL = 3000;
  const shows = [...document.querySelectorAll('[data-rotate]')].map((art, i) => {
    const imgs = [...art.querySelectorAll('img')];
    const card = art.closest('.path') || art;
    const show = { imgs, at: 0, hover: false, focus: false, timer: 0, offset: i * (INTERVAL / 2) };
    card.addEventListener('mouseenter', () => { show.hover = true; });
    card.addEventListener('mouseleave', () => { show.hover = false; });
    card.addEventListener('focusin', () => { show.focus = true; });
    card.addEventListener('focusout', () => { show.focus = false; });
    return show;
  }).filter((s) => s.imgs.length > 1);

  const step = (s) => {
    if (s.hover || s.focus || document.hidden) return;
    s.imgs[s.at].classList.remove('is-on');
    s.at = (s.at + 1) % s.imgs.length;
    s.imgs[s.at].classList.add('is-on');
  };
  const stop = () => shows.forEach((s) => { clearTimeout(s.timer); clearInterval(s.timer); s.timer = 0; });
  const start = () => {
    stop();
    if (reduce.matches) {
      // Back to the first picture, and stay there.
      shows.forEach((s) => { s.imgs.forEach((img, j) => img.classList.toggle('is-on', j === 0)); s.at = 0; });
      return;
    }
    // Stagger the cards so they do not change at the same moment.
    shows.forEach((s) => { s.timer = setTimeout(() => { step(s); s.timer = setInterval(() => step(s), INTERVAL); }, INTERVAL + s.offset); });
  };
  reduce.addEventListener('change', start);
  start();
})();

// The neural network behind the page: neurons joined by faint lines. Now and then one fires,
// and pulses travel along its connections; a neighbour that receives one may fire in turn.
// It is drawn faintly (see .neural-bg in portal.css) so it never competes with the text.
// With reduced motion it is drawn once, still. It pauses while the tab is hidden.
(() => {
  const canvas = document.querySelector('[data-neural-bg]');
  const ctx = canvas && canvas.getContext && canvas.getContext('2d');
  if (!ctx) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const dark = window.matchMedia('(prefers-color-scheme: dark)');
  const PULSE_SPEED = 140;       // CSS px per second
  const REFRACTORY = 1.4;        // seconds before a neuron can fire again
  const SPONTANEOUS = 0.7;       // spontaneous firings per second, across the whole network
  const PASS_ON = 0.3;           // chance a neighbour fires when a pulse arrives
  const MAX_PULSES = 60;

  let w = 0, h = 0, dpr = 1, nodes = [], edges = [], pulses = [], raf = 0, last = 0, time = 0;
  let colours = { net: '42,100,196', fire: '14,150,168' };
  let glow = null;

  const readColours = () => {
    const cs = getComputedStyle(document.documentElement);
    const rgb = (name, fallback) => {
      const parts = cs.getPropertyValue(name).trim().split(/[\s,]+/).map(Number);
      return parts.length === 3 && parts.every((n) => Number.isFinite(n)) ? parts.join(',') : fallback;
    };
    colours = { net: rgb('--net', colours.net), fire: rgb('--net-fire', colours.fire) };
    // A soft glow sprite, drawn once, so firing neurons glow without costly canvas shadows.
    const size = 64;
    glow = document.createElement('canvas');
    glow.width = glow.height = size;
    const g = glow.getContext('2d');
    const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, `rgba(${colours.fire},.9)`);
    grad.addColorStop(.25, `rgba(${colours.fire},.35)`);
    grad.addColorStop(1, `rgba(${colours.fire},0)`);
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
  };

  const size = () => {
    w = window.innerWidth; h = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const build = () => {
    size();
    // About one neuron per 16,000 px², within limits, spread on a jittered grid.
    const count = Math.max(24, Math.min(110, Math.round((w * h) / 16000)));
    const cols = Math.max(1, Math.round(Math.sqrt(count * w / h)));
    const rows = Math.max(1, Math.ceil(count / cols));
    const cw = w / cols, ch = h / rows;
    nodes = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const x = (c + .15 + Math.random() * .7) * cw, y = (r + .15 + Math.random() * .7) * ch;
      nodes.push({ x, y, hx: x, hy: y, phase: Math.random() * Math.PI * 2, drift: 2 + Math.random() * 4,
        r: 1.3 + Math.random() * 1.2, act: 0, rest: 0, links: [] });
    }
    // Join each neuron to its nearest neighbours.
    const maxDist = Math.max(cw, ch) * 2.1;
    const seen = new Set();
    edges = [];
    nodes.forEach((a, i) => {
      nodes.map((b, j) => ({ j, d: Math.hypot(a.x - b.x, a.y - b.y) }))
        .filter((o) => o.j !== i && o.d < maxDist)
        .sort((p, q) => p.d - q.d).slice(0, 3)
        .forEach(({ j }) => {
          const key = i < j ? `${i}-${j}` : `${j}-${i}`;
          if (seen.has(key)) return;
          seen.add(key);
          const e = { a: i, b: j, act: 0 };
          edges.push(e); a.links.push(e); nodes[j].links.push(e);
        });
    });
    pulses = [];
  };

  const fire = (i) => {
    const n = nodes[i];
    if (n.rest > 0) return;
    n.act = 1; n.rest = REFRACTORY;
    n.links.forEach((e) => {
      if (pulses.length >= MAX_PULSES) return;
      const to = e.a === i ? e.b : e.a;
      pulses.push({ from: i, to, e, t: 0, len: Math.hypot(nodes[to].x - n.x, nodes[to].y - n.y) || 1 });
    });
  };

  const update = (dt) => {
    time += dt;
    nodes.forEach((n) => {
      n.x = n.hx + Math.sin(time * .2 + n.phase) * n.drift;
      n.y = n.hy + Math.cos(time * .17 + n.phase) * n.drift;
      n.act = Math.max(0, n.act - dt * 1.3);
      n.rest = Math.max(0, n.rest - dt);
    });
    edges.forEach((e) => { e.act = Math.max(0, e.act - dt * 1.6); });
    if (Math.random() < SPONTANEOUS * dt) fire(Math.floor(Math.random() * nodes.length));
    const arrived = [];
    pulses = pulses.filter((p) => {
      p.t += (PULSE_SPEED * dt) / p.len;
      p.e.act = Math.max(p.e.act, .8);
      if (p.t < 1) return true;
      arrived.push(p.to);
      return false;
    });
    // Fire after the filter, so the new pulses join the list.
    arrived.forEach((i) => {
      if (Math.random() < PASS_ON) fire(i);
      else nodes[i].act = Math.max(nodes[i].act, .35);
    });
  };

  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    ctx.lineWidth = 1;
    // Quiet connections, in one pass.
    ctx.strokeStyle = `rgba(${colours.net},.2)`;
    ctx.beginPath();
    edges.forEach((e) => { const a = nodes[e.a], b = nodes[e.b]; ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); });
    ctx.stroke();
    // Connections that just carried a pulse.
    edges.forEach((e) => {
      if (e.act <= .01) return;
      const a = nodes[e.a], b = nodes[e.b];
      ctx.strokeStyle = `rgba(${colours.fire},${(e.act * .4).toFixed(3)})`;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    });
    // Pulses: a bright head with a short fading tail.
    ctx.lineWidth = 1.6;
    pulses.forEach((p) => {
      const a = nodes[p.from], b = nodes[p.to];
      const t = Math.min(1, p.t), t0 = Math.max(0, t - 24 / p.len);
      const hx = a.x + (b.x - a.x) * t, hy = a.y + (b.y - a.y) * t;
      const tx = a.x + (b.x - a.x) * t0, ty = a.y + (b.y - a.y) * t0;
      const grad = ctx.createLinearGradient(tx, ty, hx, hy);
      grad.addColorStop(0, `rgba(${colours.fire},0)`);
      grad.addColorStop(1, `rgba(${colours.fire},.75)`);
      ctx.strokeStyle = grad;
      ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(hx, hy); ctx.stroke();
      ctx.globalAlpha = .55; ctx.drawImage(glow, hx - 6, hy - 6, 12, 12); ctx.globalAlpha = 1;
    });
    // Neurons, glowing while they fire.
    ctx.fillStyle = `rgba(${colours.net},.45)`;
    ctx.beginPath();
    nodes.forEach((n) => { ctx.moveTo(n.x + n.r, n.y); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); });
    ctx.fill();
    nodes.forEach((n) => {
      if (n.act <= .01) return;
      const s = 10 + n.act * 26;
      ctx.globalAlpha = n.act;
      ctx.drawImage(glow, n.x - s / 2, n.y - s / 2, s, s);
    });
    ctx.globalAlpha = 1;
  };

  const frame = (now) => {
    const dt = Math.min(.05, (now - last) / 1000 || 0);
    last = now;
    update(dt);
    draw();
    raf = requestAnimationFrame(frame);
  };
  const stop = () => { cancelAnimationFrame(raf); raf = 0; };
  const run = () => {
    stop();
    if (reduce.matches) { draw(); return; }   // a still, faint network
    if (document.hidden) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  };

  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // Phones resize as the address bar shows and hides: keep the same network for that.
      const small = window.innerWidth === w && Math.abs(window.innerHeight - h) < 160
        && Math.min(window.devicePixelRatio || 1, 2) === dpr;
      if (small) size(); else build();
      run();
    }, 150);
  });
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : run()));
  reduce.addEventListener('change', run);
  const recolour = () => { readColours(); if (!raf) draw(); };
  dark.addEventListener('change', recolour);
  new MutationObserver(recolour).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  readColours();
  build();
  run();
})();
